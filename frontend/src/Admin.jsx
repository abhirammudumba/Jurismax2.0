
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  RefreshCw,
  Users,
  Mail,
  Phone,
  Calendar,
  FileText,
  ArrowLeft,
  LogOut,
  Lock,
  User,
  Search,
  Trash2,
  Download
} from 'lucide-react';

const API_URL = 'https://jurismax2-0.onrender.com';
const LOGO_URL = '/jurismax-logo.avif';

function AdminDashboard() {
  const [token, setToken] = useState(
    sessionStorage.getItem('adminToken') || ''
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [statusFilter, setStatusFilter] = useState('All');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Admin login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoginLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      sessionStorage.setItem('adminToken', data.token);
      setToken(data.token);
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    setToken('');
    setEnquiries([]);
    setUsername('');
    setPassword('');
    setError('');
  };

  // Fetch enquiries
  const fetchEnquiries = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/enquiries`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load enquiries.');
      }

      setEnquiries(data.enquiries || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update enquiry status
  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(
        `${API_URL}/api/enquiries/${id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        setError('Session expired. Please log in again.');
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update status.');
      }

      setEnquiries((previous) =>
        previous.map((item) =>
          item._id === id
            ? { ...item, status: data.enquiry.status }
            : item
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // Open delete popup
  const openDeleteModal = (id) => {
    setSelectedEnquiryId(id);
    setShowDeleteModal(true);
  };

  // Close delete popup
  const closeDeleteModal = () => {
    if (deletingId !== null) return;

    setShowDeleteModal(false);
    setSelectedEnquiryId(null);
  };

  // Delete enquiry
  const deleteEnquiry = async () => {
    const id = selectedEnquiryId;

    if (!id) return;

    setDeletingId(id);
    setError('');

    try {
      const response = await fetch(
        `${API_URL}/api/enquiries/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        setError('Session expired. Please log in again.');
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete enquiry.');
      }

      setEnquiries((previous) =>
        previous.filter((item) => item._id !== id)
      );

      setShowDeleteModal(false);
      setSelectedEnquiryId(null);

    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Export enquiries to CSV
  const exportToCSV = () => {
    if (enquiries.length === 0) return;

    const headers = [
      'Customer Name',
      'Email',
      'Phone',
      'Service',
      'Message',
      'Status',
      'Date'
    ];

    const escapeCSV = (value) => {
      return `"${String(value ?? '').replace(/"/g, '""')}"`;
    };

    const rows = enquiries.map((item) => [
      item.name,
      item.email,
      item.phone,
      item.service,
      item.message,
      item.status || 'Pending',
      item.createdAt
        ? new Date(item.createdAt).toLocaleString()
        : ''
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.map(escapeCSV).join(','))
    ].join('\n');

    const blob = new Blob(
      ['\uFEFF' + csvContent],
      { type: 'text/csv;charset=utf-8;' }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'Jurismax_Enquiries.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (token) {
      fetchEnquiries();
    }
  }, [token]);

  // Search and status filters
  const filteredEnquiries = enquiries.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      item.name?.toLowerCase().includes(searchText) ||
      item.email?.toLowerCase().includes(searchText) ||
      item.service?.toLowerCase().includes(searchText);

    const currentStatus = item.status || 'Pending';

    const matchesStatus =
      statusFilter === 'All' || currentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Status colors
  const statusStyle = (status) => {
    if (status === 'Completed') {
      return { background: '#e5f4e9', color: '#216b35' };
    }

    if (status === 'In Progress') {
      return { background: '#eff6ff', color: '#1d4ed8' };
    }

    return { background: '#fff3d9', color: '#8a5a00' };
  };

  // Login page
  if (!token) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');
        `}</style>

        <div style={styles.loginPage}>
          <form onSubmit={handleLogin} style={styles.loginCard}>

            <div style={styles.logo}>
              <img
                src={LOGO_URL}
                alt="Jurismax Startup Studio"
                style={styles.loginLogoImage}
              />
            </div>

            <div style={styles.loginLabel}>ADMINISTRATION PORTAL</div>

            <h1 style={styles.loginTitle}>Admin Login</h1>

            <p style={styles.subtitle}>
              Sign in to access your dashboard
            </p>

            <label style={styles.label}>Username</label>

            <div style={styles.inputBox}>
              <User size={18} color="#777" />
              <input
                type="text"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <label style={styles.label}>Password</label>

            <div style={styles.inputBox}>
              <Lock size={18} color="#777" />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button
              type="submit"
              disabled={loginLoading}
              style={styles.loginButton}
            >
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <a href="/" style={styles.backLink}>
              <ArrowLeft size={16} />
              Back to Website
            </a>
          </form>
        </div>
      </>
    );
  }

  // Dashboard
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');

        button, input, select {
          font-family: 'Inter', sans-serif;
        }

        button {
          transition: all 0.25s ease;
        }

        button:focus-visible,
        input:focus-visible,
        select:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 3px;
        }

        .admin-logo {
          transition: opacity 0.2s ease;
        }

        .admin-logo:hover {
          opacity: 0.85;
        }
      `}</style>

      <div style={styles.page}>
        <header style={styles.header}>
          <div style={styles.brand}>
            <img
              src={LOGO_URL}
              alt="Jurismax Startup Studio"
              className="admin-logo"
              style={styles.headerLogoImage}
            />

            <span style={styles.adminBadge}>ADMIN</span>
          </div>

          <button onClick={handleLogout} style={styles.logoutButton}>
            <LogOut size={17} />
            Logout
          </button>
        </header>

        <main style={styles.container}>
          <div style={styles.headingRow}>
            <div>
              <span style={styles.pageKicker}>CONTROL PANEL</span>
              <h1 style={styles.title}>Admin Dashboard</h1>
              <p style={styles.subtitle}>
                Manage and review customer enquiries
              </p>
            </div>

            <div style={styles.actionButtons}>
              <button onClick={fetchEnquiries} style={styles.refreshButton}>
                <RefreshCw size={16} />
                Refresh
              </button>

              <button
                onClick={exportToCSV}
                style={{
                  ...styles.exportButton,
                  opacity: enquiries.length === 0 ? 0.5 : 1,
                  cursor: enquiries.length === 0 ? 'not-allowed' : 'pointer'
                }}
                disabled={enquiries.length === 0}
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Dashboard statistics */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <Users size={27} color="#2563eb" />
              <div>
                <h2>{enquiries.length}</h2>
                <p>Total Enquiries</p>
              </div>
            </div>

            <div style={styles.statCard}>
              <FileText size={27} color="#2563eb" />
              <div>
                <h2>
                  {enquiries.filter(
                    (item) => (item.status || 'Pending') === 'Pending'
                  ).length}
                </h2>
                <p>Pending</p>
              </div>
            </div>

            <div style={styles.statCard}>
              <LayoutDashboard size={27} color="#2563eb" />
              <div>
                <h2>
                  {enquiries.filter(
                    (item) => item.status === 'In Progress'
                  ).length}
                </h2>
                <p>In Progress</p>
              </div>
            </div>

            <div style={styles.statCard}>
              <Users size={27} color="#2563eb" />
              <div>
                <h2>
                  {enquiries.filter(
                    (item) => item.status === 'Completed'
                  ).length}
                </h2>
                <p>Completed</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div style={styles.searchBox}>
            <Search size={19} color="#777" />
            <input
              type="text"
              placeholder="Search by customer, email or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Status filters */}
          <div style={styles.filterSection}>
            <span style={styles.filterLabel}>FILTER BY STATUS</span>

            <div style={styles.filterButtons}>
              {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  style={{
                    ...styles.filterButton,
                    ...(statusFilter === status
                      ? styles.activeFilterButton
                      : {})
                  }}
                >
                  {status}

                  <span style={styles.filterCount}>
                    {status === 'All'
                      ? enquiries.length
                      : enquiries.filter(
                          (item) =>
                            (item.status || 'Pending') === status
                        ).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <h2 style={styles.sectionTitle}>
            <LayoutDashboard size={21} color="#2563eb" />
            Customer Enquiries
          </h2>

          {loading && <p style={styles.infoMessage}>Loading enquiries...</p>}
          {error && <p style={styles.error}>{error}</p>}

          {!loading && !error && filteredEnquiries.length === 0 && (
            <div style={styles.empty}>
              <FileText size={35} />
              <p>No enquiries found.</p>
            </div>
          )}

          {/* Enquiry cards */}
          <div style={styles.grid}>
            {filteredEnquiries.map((item) => (
              <div key={item._id} style={styles.card}>
                <div style={styles.cardTop}>
                  <h3>{item.name}</h3>
                  <span style={styles.serviceTag}>{item.service}</span>
                </div>

                <p style={styles.detail}>
                  <Mail size={16} />
                  {item.email}
                </p>

                <p style={styles.detail}>
                  <Phone size={16} />
                  {item.phone}
                </p>

                <p style={styles.detail}>
                  <Calendar size={16} />
                  {new Date(item.createdAt).toLocaleString()}
                </p>

                <div style={styles.message}>
                  <strong>Message</strong>
                  <p>{item.message}</p>
                </div>

                <div style={styles.statusSection}>
                  <label style={styles.label}>Enquiry Status</label>

                  <select
                    value={item.status || 'Pending'}
                    onChange={(e) => updateStatus(item._id, e.target.value)}
                    style={{
                      ...styles.statusSelect,
                      ...statusStyle(item.status || 'Pending')
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => openDeleteModal(item._id)}
                  style={styles.deleteButton}
                >
                  <Trash2 size={16} />
                  Delete Enquiry
                </button>
              </div>
            ))}
          </div>

          {/* Delete confirmation modal */}
          {showDeleteModal && (
            <div style={styles.modalOverlay}>
              <div
                style={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-modal-title"
              >
                <img
                  src={LOGO_URL}
                  alt="Jurismax Startup Studio"
                  style={styles.modalLogoImage}
                />

                <div style={styles.modalIcon}>
                  <Trash2 size={27} />
                </div>

                <h2 id="delete-modal-title" style={styles.modalTitle}>
                  Delete Enquiry?
                </h2>

                <p style={styles.modalText}>
                  Are you sure you want to permanently delete this enquiry?
                  This action cannot be undone.
                </p>

                <div style={styles.modalButtons}>
                  <button
                    type="button"
                    onClick={closeDeleteModal}
                    style={styles.cancelButton}
                    disabled={deletingId !== null}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={deleteEnquiry}
                    style={styles.confirmDeleteButton}
                    disabled={deletingId !== null}
                  >
                    {deletingId !== null ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

const styles = {
  loginPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f3f3f3',
    padding: '20px',
    fontFamily: "'Inter', sans-serif"
  },

  loginCard: {
    width: '100%',
    maxWidth: '430px',
    background: '#fff',
    padding: '42px',
    border: '1px solid #e5e5e5',
    borderRadius: '10px',
    boxShadow: '0 15px 45px rgba(0,0,0,0.08)'
  },

  logo: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '25px'
  },

  loginLogoImage: {
    width: '240px',
    maxWidth: '100%',
    height: 'auto',
    maxHeight: '90px',
    objectFit: 'contain'
  },

  loginLabel: {
    textAlign: 'center',
    color: '#2563eb',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '2.5px',
    marginBottom: '13px'
  },

  loginTitle: {
    textAlign: 'center',
    fontFamily: "'Manrope', sans-serif",
    fontSize: '29px',
    fontWeight: '800',
    color: '#111',
    letterSpacing: '-1px'
  },

  label: {
    display: 'block',
    fontWeight: '700',
    fontSize: '13px',
    marginTop: '20px',
    marginBottom: '8px',
    color: '#333'
  },

  inputBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid #d5d5d5',
    padding: '13px',
    borderRadius: '5px',
    transition: 'border 0.2s ease'
  },

  input: {
    width: '100%',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: '#111',
    background: 'transparent'
  },

  loginButton: {
    width: '100%',
    padding: '15px',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    marginTop: '26px',
    cursor: 'pointer',
    fontWeight: '800',
    fontSize: '13px',
    letterSpacing: '0.4px'
  },

  backLink: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '7px',
    marginTop: '23px',
    color: '#555',
    fontSize: '13px',
    fontWeight: '600'
  },

  subtitle: {
    color: '#777',
    marginTop: '8px',
    fontSize: '13px',
    lineHeight: '1.7'
  },

  error: {
    color: '#b00020',
    marginTop: '15px',
    fontSize: '13px'
  },

  page: {
    minHeight: '100vh',
    background: '#f5f5f5',
    fontFamily: "'Inter', sans-serif",
    color: '#111'
  },

  header: {
    background: '#111',
    color: '#fff',
    padding: '14px 5%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: '82px'
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },

  headerLogoImage: {
    width: '220px',
    height: 'auto',
    maxHeight: '65px',
    objectFit: 'contain'
  },

  adminBadge: {
    color: '#60a5fa',
    borderLeft: '1px solid #555',
    paddingLeft: '15px',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '2px'
  },

  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#fff',
    color: '#111',
    border: 'none',
    padding: '11px 17px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '12px'
  },

  container: {
    maxWidth: '1200px',
    margin: 'auto',
    padding: '42px 20px'
  },

  headingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap',
    marginBottom: '32px'
  },

  pageKicker: {
    display: 'block',
    color: '#2563eb',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '2px',
    marginBottom: '9px'
  },

  title: {
    fontFamily: "'Manrope', sans-serif",
    fontSize: '31px',
    fontWeight: '800',
    letterSpacing: '-1px',
    color: '#111'
  },

  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },

  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 17px',
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700'
  },

  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 16px',
    background: '#2563eb',
    color: '#fff',
    border: '1px solid #2563eb',
    borderRadius: '5px',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '32px'
  },

  statCard: {
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: '7px',
    padding: '23px',
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.025)'
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#fff',
    border: '1px solid #ddd',
    padding: '14px',
    borderRadius: '5px',
    marginBottom: '23px'
  },

  searchInput: {
    width: '100%',
    border: 'none',
    outline: 'none',
    fontSize: '13px',
    background: 'transparent'
  },

  filterSection: {
    marginBottom: '30px'
  },

  filterLabel: {
    display: 'block',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '1.5px',
    marginBottom: '13px',
    color: '#666'
  },

  filterButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '9px'
  },

  filterButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '10px 14px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    background: '#fff',
    color: '#333',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
  },

  activeFilterButton: {
    background: '#111',
    color: '#fff',
    border: '1px solid #111'
  },

  filterCount: {
    fontWeight: '800'
  },

  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    fontFamily: "'Manrope', sans-serif",
    fontSize: '21px',
    fontWeight: '800',
    letterSpacing: '-0.5px'
  },

  infoMessage: {
    color: '#666',
    fontSize: '14px'
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  },

  card: {
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    padding: '23px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.025)'
  },

  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '18px'
  },

  serviceTag: {
    background: '#eff6ff',
    color: '#1d4ed8',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700'
  },

  detail: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    marginBottom: '12px',
    fontSize: '13px',
    color: '#555',
    overflowWrap: 'anywhere'
  },

  message: {
    borderTop: '1px solid #eee',
    paddingTop: '15px',
    marginTop: '15px',
    lineHeight: '1.7',
    overflowWrap: 'anywhere',
    fontSize: '13px'
  },

  statusSection: {
    borderTop: '1px solid #eee',
    marginTop: '18px',
    paddingTop: '5px'
  },

  statusSelect: {
    width: '100%',
    padding: '11px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer'
  },

  empty: {
    background: '#fff',
    padding: '45px',
    textAlign: 'center',
    border: '1px solid #ddd',
    borderRadius: '7px',
    color: '#777'
  },

  deleteButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '18px',
    padding: '12px',
    background: '#fff',
    color: '#b91c1c',
    border: '1px solid #e5b5b5',
    borderRadius: '5px',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer'
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 9999
  },

  modal: {
    width: '100%',
    maxWidth: '420px',
    background: '#fff',
    padding: '30px',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 15px 50px rgba(0,0,0,0.2)'
  },

  modalLogoImage: {
    width: '190px',
    maxWidth: '100%',
    height: 'auto',
    maxHeight: '65px',
    objectFit: 'contain',
    marginBottom: '25px'
  },

  modalIcon: {
    width: '60px',
    height: '60px',
    margin: 'auto',
    borderRadius: '50%',
    background: '#f1f1f1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#111'
  },

  modalTitle: {
    marginTop: '18px',
    marginBottom: '10px',
    color: '#111',
    fontFamily: "'Manrope', sans-serif"
  },

  modalText: {
    color: '#666',
    fontSize: '13px',
    lineHeight: '1.7',
    margin: 0
  },

  modalButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '25px'
  },

  cancelButton: {
    flex: 1,
    padding: '12px',
    background: '#fff',
    color: '#111',
    border: '1px solid #ccc',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '700'
  },

  confirmDeleteButton: {
    flex: 1,
    padding: '12px',
    background: '#111',
    color: '#fff',
    border: '1px solid #111',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '700'
  }
};

export default AdminDashboard;
