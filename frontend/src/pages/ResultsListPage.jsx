import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';

const ResultsListPage = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/upload`);
      setAssessments(res.data);
    } catch (err) {
      setError('Error fetching assessments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleDelete = (id) => {
    setAssessments(prev => prev.filter(a => a._id !== id));
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return <DataTable assessments={assessments} onDelete={handleDelete} />;
};

export default ResultsListPage; 
