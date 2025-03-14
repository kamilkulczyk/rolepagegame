package config

import (
    "context"
    "fmt"
    "log"
    "os"
    "sync"

    "github.com/jackc/pgx/v5/pgxpool"
    "github.com/jackc/pgx/v5"
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
	once          sync.Once
)

func CacheIDs(db *pgx.Conn) error {
	once.Do(func() {
		ObjectTypeIDs = make(map[string]int)
		PurposeIDs = make(map[string]int)

		rows, err := db.Query(context.Background(), `SELECT id, name FROM object_types`)
		if err != nil {
			fmt.Println("ERROR: Failed to fetch object types:", err)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var id int
			var name string
			rows.Scan(&id, &name)
			ObjectTypeIDs[name] = id
		}

		rows, err = db.Query(context.Background(), `SELECT id, name FROM purposes`)
		if err != nil {
			fmt.Println("ERROR: Failed to fetch purposes:", err)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var id int
			var name string
			rows.Scan(&id, &name)
			PurposeIDs[name] = id
		}
	})

	return nil
}