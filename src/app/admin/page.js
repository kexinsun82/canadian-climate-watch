'use client';
import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';

const getUserRoleFromUser = (user) => {
  if (!user) return 'visitor';
  
  const roles = user.publicMetadata?.roles || [];
  const userRoles = Array.isArray(roles) ? roles : [roles];
  
  if (userRoles.includes('admin')) return 'admin';
  if (userRoles.includes('member')) return 'member';
  
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
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="text-xl font-bold">Admin Dashboard</div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div 
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all ${
              activeTab === 'reports' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setActiveTab('reports')}
          >
            <div className="text-gray-600 text-sm font-medium">All Reports</div>
            <div className="text-3xl font-bold mt-2">{reports.length}</div>
          </div>
          
          <div 
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all ${
              activeTab === 'users' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setActiveTab('users')}
          >
            <div className="text-gray-600 text-sm font-medium">All Users</div>
            <div className="text-3xl font-bold mt-2">{users.length}</div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No reports found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {reports.map(report => (
        <div key={report._id} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 flex flex-col md:flex-row">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {report.label}
                </div>
                <div className="ml-4 text-gray-500 text-sm">
                  {new Date(report.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-2">{report.title || 'Untitled Report'}</h3>
              <p className="text-gray-600 mb-4">{report.notes}</p>
              
              <div className="flex items-center">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                <div className="ml-4">
                  <div className="font-medium">{report.userName}</div>
                  <div className="text-gray-500 text-sm">{report.userEmail}</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col justify-center items-center mt-4 md:mt-0 md:ml-4">
              <button
                onClick={() => onDelete(report._id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function UsersList({ users, onDelete, onRoleChange }) {
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No users found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map(user => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img className="h-10 w-10 rounded-full" src={user.imageUrl} alt={user.username} />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.username || 'No username'}</div>
                    <div className="text-sm text-gray-500">{user.firstName} {user.lastName}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.primaryEmailAddress.emailAddress}</div>
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onDelete(user.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}