import { useNavigate, useParams } from 'react-router-dom';
import EmployeeDetail from '../EmployeeDetail';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  if (!id) return null;

  return (
    <EmployeeDetail
      employeeId={id}
      onBack={() => navigate('/employees')}
      onEdit={() => navigate(`/employees/${id}/edit`)}
      onDeleted={() => navigate('/employees')}
    />
  );
}
