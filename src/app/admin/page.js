'use client';
import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { getLevelText, getLevelColor } from '../../lib/utils';

const getUserRoleFromUser = (user) => {
  if (!user) return 'visitor';

  let roles = user.publicMetadata?.roles;
  if (roles) {
    if (typeof roles === 'string') {
      try {
        const parsed = JSON.parse(roles);
        if (Array.isArray(parsed)) roles = parsed;
        else roles = [roles];
      } catch {
        roles = [roles];
      }
    }
    if (Array.isArray(roles) && roles.includes('admin')) return 'admin';
    if (Array.isArray(roles) && roles.includes('member')) return 'member';
  }

  const role = user.publicMetadata?.role;
  if (role === 'admin') return 'admin';
  if (role === 'member') return 'member';

  return 'visitor';
};

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('visitor');
  
  useEffect(() => {
    if (isLoaded && user) {
      console.log('user.publicMetadata:', user?.publicMetadata); 
      const userRole = getUserRoleFromUser(user);
      setRole(userRole);
    }
  }, [isLoaded, user]);

  useEffect(() => {
    if (role === 'admin') {
      fetchReports();
      fetchUsers();
    }
  }, [role]);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const deleteReport = async (reportId) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setReports(reports.filter(report => report._id !== reportId));
      }
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Unauthorized Access</h2>
          <p className="text-gray-600">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-card)]">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div 
            className={`border rounded-lg p-6 cursor-pointer transition-all ${
              activeTab === 'reports' ? 'bg-[var(--color-primary)] text-black' : 'bg-transparent text-black hover:bg-[var(--color-primary-light)]'
            }`}
            onClick={() => setActiveTab('reports')}
          >
            <div className="text-black-600 text-sm font-medium">All Reports</div>
            <div className="text-3xl font-bold mt-2">{reports.length}</div>
          </div>
          
          <div 
            className={`border rounded-lg p-6 cursor-pointer transition-all ${
              activeTab === 'users' ? 'bg-[var(--color-primary)] text-black' : 'bg-transparent text-black hover:bg-[var(--color-primary-light)]'
            }`}
            onClick={() => setActiveTab('users')}
          >
            <div className="text-black-600 text-sm font-medium">All Users</div>
            <div className="text-3xl font-bold mt-2">{users.length}</div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-accent)]"></div>
          </div>
        ) : activeTab === 'reports' ? (
          <ReportsList reports={reports} onDelete={deleteReport} />
        ) : (
          <UsersList 
            users={users} 
            onDelete={deleteUser} 
            onRoleChange={updateUserRole} 
          />
        )}
      </div>
    </div>
  );
}

function ReportsList({ reports, onDelete }) {
  const [addressCache, setAddressCache] = useState({});
  // Noninatim API
  async function fetchAddress(lat, lng) {
    const key = `${lat},${lng}`;
    if (addressCache[key]) return addressCache[key];
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const address = data.address || {};
      const street = address.road || address.pedestrian || address.cycleway || '';
      const city = address.city || address.town || address.village || address.hamlet || '';
      const province = address.state || address.region || '';
      const result = { street, city, province };
      setAddressCache(prev => ({ ...prev, [key]: result }));
      return result;
    } catch {
      return { street: '', city: '', province: '' };
    }
  }
  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <p className="text-gray-500">No reports found</p>
      </div>
    );
  }
  return (
    // All Reports
    <div className="grid grid-cols-1 gap-6">
      {reports.map(report => (
        <AdminReportCard key={report._id} report={report} onDelete={onDelete} fetchAddress={fetchAddress} />
      ))}
    </div>
  );
}

function UsersList({ users, onDelete, onRoleChange }) {
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <p className="text-gray-500">No users found</p>
      </div>
    );
  }

  return (
    // All Users
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[var(--color-primary-light)] text-black">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Joined
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium">{user.username || 'No username'}</div>
                  <div className="text-sm text-gray-500">{user.firstName} {user.lastName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">{user.primaryEmailAddress.emailAddress}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role || 'member'}
                    onChange={(e) => onRoleChange(user.id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onDelete(user.id)}
                    className="bg-[var(--color-accent)] hover:bg-[var(--color-primary)] text-sm font-medium rounded-full px-3 py-1 text-white"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile table */}
      <div className="md:hidden">
        <div className="p-4">
          <div className="text-sm font-medium uppercase tracking-wider mb-4 px-2">All Users</div>
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="border rounded-lg p-4 space-y-3">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">Username/Name</div>
                  <div className="text-sm font-medium">{user.username || 'No username'}</div>
                  <div className="text-sm text-gray-500">{user.firstName} {user.lastName}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">Email</div>
                  <div className="text-sm text-gray-900">{user.primaryEmailAddress.emailAddress}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">Role</div>
                  <select
                    value={user.role || 'member'}
                    onChange={(e) => onRoleChange(user.id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm w-full"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">Joined</div>
                  <div className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <button
                    onClick={() => onDelete(user.id)}
                    className="bg-[var(--color-accent)] hover:bg-[var(--color-primary)] text-sm font-medium rounded-full px-3 py-1 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminReportCard({ report, onDelete, fetchAddress }) {
  const [address, setAddress] = useState(null);
  useEffect(() => {
    let mounted = true;
    if (report.location && Array.isArray(report.location.coordinates) && report.location.coordinates.length === 2) {
      const lat = report.location.coordinates[1];
      const lng = report.location.coordinates[0];
      fetchAddress(lat, lng).then(addr => { if (mounted) setAddress(addr); });
    }
    return () => { mounted = false; };
  }, [report.location, fetchAddress]);
  return (
    <div className="bg-white border border-black rounded-lg overflow-hidden">
      <div className="p-6 flex flex-col md:flex-row">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {report.label}
            </div>
            <div className={`ml-2 text-xs font-medium px-2.5 py-0.5 rounded ${getLevelColor(report.level)}`}>
              {getLevelText(report.level)}
            </div>
            <div className="ml-4 text-gray-500 text-sm">
              {new Date(report.createdAt).toLocaleDateString()}
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">{report.notes || 'Untitled Report'}</h3>
          {address && (
            <div className="text-xs text-gray-600 mb-2">
              {address.street && <span>{address.street}, </span>}
              {address.city && <span>{address.city}, </span>}
              {address.province && <span>{address.province}</span>}
            </div>
          )}
          {/* <p className="text-gray-600 mb-4">{report.location.coordinates[0]}, {report.location.coordinates[1]}</p> */}
          <div className="font-medium">{report.userName}</div>
          <div className="text-gray-500 text-sm">{report.userEmail}</div>
        </div>
        <div className="flex flex-col justify-center items-center mt-4 md:mt-0 md:ml-4">
          <button
            onClick={() => onDelete(report._id)}
            className="px-3 py-1 bg-[var(--color-accent)] text-white rounded-full text-sm font-medium hover:bg-[var(--color-primary)] flex items-center"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}