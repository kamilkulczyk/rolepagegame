package config

import (
    "context"
    "fmt"
    "log"
    "os"

    "github.com/jackc/pgx/v5/pgxpool"
)

var dbpool *pgxpool.Pool

func ConnectDB() {
    connStr := fmt.Sprintf(
        "user=%s password=%s host=%s port=%s dbname=%s sslmode=require",
        os.Getenv("DB_USER"),
        os.Getenv("DB_PASS"),
        os.Getenv("DB_HOST"),
        os.Getenv("DB_PORT"),
        os.Getenv("DB_NAME"),
    )

    var err error
    dbpool, err = pgxpool.New(context.Background(), connStr)
    if err != nil {
        log.Fatalf("Failed to connect to database: %v", err)
    }

    log.Println("✅ Connected to database (Using Pool)")

    if err := CacheIDs(dbpool); err != nil {
        log.Fatalf("Failed to cache object type and purpose IDs: %v", err)
    }

    log.Println("✅ Cached object type and purpose IDs")
}

func GetDB() *pgxpool.Pool {
    return dbpool
}

func CloseDB() {
    if dbpool != nil {
        dbpool.Close()
    }
}

var (
	ObjectTypeIDs map[string]int
	PurposeIDs    map[string]int
)

func CacheIDs(db *pgxpool.Pool) error {
    conn, err := db.Acquire(context.Background())
    if err != nil {
        return fmt.Errorf("failed to acquire DB connection: %w", err)
    }
    defer conn.Release()

    ObjectTypeIDs = make(map[string]int)
    PurposeIDs = make(map[string]int)

    rows, err := conn.Query(context.Background(), "SELECT name, id FROM object_types")
    if err != nil {
        return fmt.Errorf("failed to cache object types: %w", err)
    }
    defer rows.Close()

    for rows.Next() {
        var name string
        var id int
        if err := rows.Scan(&name, &id); err != nil {
            return fmt.Errorf("failed to scan object type: %w", err)
        }
        ObjectTypeIDs[name] = id
    }

    rows, err = conn.Query(context.Background(), "SELECT name, id FROM purposes")
    if err != nil {
        return fmt.Errorf("failed to cache purposes: %w", err)
    }
    defer rows.Close()

    for rows.Next() {
        var name string
        var id int
        if err := rows.Scan(&name, &id); err != nil {
            return fmt.Errorf("failed to scan purpose: %w", err)
        }
        PurposeIDs[name] = id
    }

    return nil
}
