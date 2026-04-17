import { useState, useEffect } from "react";
import { supabase } from "../lib/authClient.js";
import styles from "./AdminPage.module.css";
import { Users, Trash2, Ban, CheckCircle, ArrowLeft, RefreshCw, ShieldAlert, Loader2, Search } from "lucide-react";

export default function AdminPage({ onBack }) {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [actionLoading, setActionLoading] = useState(null); // userId being actioned
  const [error, setError]       = useState("");
  const [toast, setToast]       = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(data.users || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const doAction = async (userId, action, email) => {
    const confirmMsg = action === "delete"
      ? `Permanently delete ${email}? This cannot be undone.`
      : action === "ban"
      ? `Ban ${email}? They won't be able to log in.`
      : `Unban ${email}?`;
    if (!window.confirm(confirmMsg)) return;

    setActionLoading(userId + action);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(`✅ ${action === "delete" ? "Deleted" : action === "ban" ? "Banned" : "Unbanned"}: ${email}`);
      fetchUsers();
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const total   = users.length;
  const banned  = users.filter(u => u.banned_until && new Date(u.banned_until) > new Date()).length;
  const thisMonth = users.filter(u => {
    const d = new Date(u.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.back} onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <div className={styles.headerTitle}><ShieldAlert size={18} /> Admin Panel</div>
        <button className={styles.refreshBtn} onClick={fetchUsers} disabled={loading}>
          <RefreshCw size={15} className={loading ? styles.spin : ""} /> Refresh
        </button>
      </header>

      <div className={styles.content}>
        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{total}</span>
            <span className={styles.statLabel}>Total Users</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{thisMonth}</span>
            <span className={styles.statLabel}>Joined This Month</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{total - banned}</span>
            <span className={styles.statLabel}>Active</span>
          </div>
          <div className={styles.stat}>
            <span className={`${styles.statNum} ${styles.statBanned}`}>{banned}</span>
            <span className={styles.statLabel}>Banned</span>
          </div>
        </div>

        {/* Search */}
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search by email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {/* Table */}
        {loading ? (
          <div className={styles.loadingWrap}><Loader2 size={28} className={styles.spin} /></div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Signed Up</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className={styles.empty}>No users found</td></tr>
                )}
                {filtered.map(u => {
                  const isBanned = u.banned_until && new Date(u.banned_until) > new Date();
                  return (
                    <tr key={u.id} className={isBanned ? styles.bannedRow : ""}>
                      <td className={styles.emailCell}>
                        <span>{u.email}</span>
                      </td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : "Never"}</td>
                      <td>
                        <span className={isBanned ? styles.badgeBanned : styles.badgeActive}>
                          {isBanned ? "Banned" : "Active"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          {isBanned ? (
                            <button
                              className={styles.unbanBtn}
                              onClick={() => doAction(u.id, "unban", u.email)}
                              disabled={!!actionLoading}
                            >
                              {actionLoading === u.id + "unban"
                                ? <Loader2 size={13} className={styles.spin} />
                                : <CheckCircle size={13} />}
                              Unban
                            </button>
                          ) : (
                            <button
                              className={styles.banBtn}
                              onClick={() => doAction(u.id, "ban", u.email)}
                              disabled={!!actionLoading}
                            >
                              {actionLoading === u.id + "ban"
                                ? <Loader2 size={13} className={styles.spin} />
                                : <Ban size={13} />}
                              Ban
                            </button>
                          )}
                          <button
                            className={styles.deleteBtn}
                            onClick={() => doAction(u.id, "delete", u.email)}
                            disabled={!!actionLoading}
                          >
                            {actionLoading === u.id + "delete"
                              ? <Loader2 size={13} className={styles.spin} />
                              : <Trash2 size={13} />}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
