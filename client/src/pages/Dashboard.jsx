import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="btn-secondary">
          Sign Out
        </button>
      </header>

      <div className="profile-card">
        <h2>Welcome, {user.name}</h2>
        <div className="profile-details">
          <div className="detail-row">
            <span className="label">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="detail-row">
            <span className="label">Role</span>
            <span className={`role-badge ${user.role}`}>{user.role}</span>
          </div>
          <div className="detail-row">
            <span className="label">User ID</span>
            <span className="muted">{user.id}</span>
          </div>
        </div>
      </div>

      {/* Admin-only section — only rendered if role is admin */}
      {user.role === 'admin' && (
        <div className="admin-panel">
          <h3>Admin Panel</h3>
          <p>You have admin access. Additional controls would appear here.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
