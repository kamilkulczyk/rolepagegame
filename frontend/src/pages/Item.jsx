import { useParams, useLocation } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import ItemView from "../components/ItemView";
import { api } from "../api";
import ItemTransfer from "../components/ItemTransfer";
import { AuthContext } from "../context/AuthContext";

const Item = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const passedItem = location.state?.item || null;

  const [item, setItem] = useState(passedItem);
  const [rpgData, setRpgData] = useState(null);
  const [loading, setLoading] = useState(!passedItem);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
  
    const fetchItemData = async () => {
      setLoading(true);
      setError(null);
  
      try {
        const itemPromise = item ? Promise.resolve(item) : api.getItemByID(id);
        const rpgDataPromise = api.getRpgDataByItemID(id).catch(() => null);
  
        const [fetchedItem, fetchedRpgData] = await Promise.all([itemPromise, rpgDataPromise]);
  
        if (isMounted) {
          setItem(fetchedItem || {});
          setRpgData(fetchedRpgData || {});
        }
      } catch (error) {
        console.error("Error fetching item data:", error);
        if (isMounted) setError(error.message || "Failed to fetch data.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
  
    fetchItemData();
  
    return () => {
      isMounted = false;
    };
  }, [id, item]);

  if (loading) return <p>Loading item...</p>;
  if (!item) return <p>Item not found</p>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <ItemView item={item} rpgData={rpgData} />
        {item.user_id === user?.id && <ItemTransfer item={item} />}
      </div>
    </div>
  );
};

export default Item;
