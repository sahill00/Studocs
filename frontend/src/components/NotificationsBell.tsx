"use client";

import { useState, useEffect } from "react";
import styles from "./NotificationsBell.module.css";

export default function NotificationsBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchNotifications(token);
    }
  }, []);

  const fetchNotifications = async (token: string) => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const [countRes, feedRes] = await Promise.all([
        fetch(`${url}/api/notifications/unread-count`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${url}/api/notifications`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (countRes.ok) {
        const countData = await countRes.json();
        setUnreadCount(countData.count);
      }
      
      if (feedRes.ok) {
        const feedData = await feedRes.json();
        setNotifications(feedData);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await fetch(`${url}/api/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(0);
      setNotifications(notifications.map((n: any) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className={styles.container}>
      <button className={styles.bellButton} onClick={() => setIsOpen(!isOpen)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className={styles.markReadBtn}>Mark all as read</button>
            )}
          </div>
          <div className={styles.list}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>No notifications yet</div>
            ) : (
              notifications.map((n: any) => (
                <div key={n.id} className={`${styles.item} ${!n.is_read ? styles.unread : ''}`}>
                  <p>{n.message}</p>
                  <span className={styles.time}>{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
