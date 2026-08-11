import { useParams } from 'react-router-dom';
import EmployeeDetail from '../EmployeeDetail';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  if (!id) return null;
  return <EmployeeDetail employeeId={id} />;
}
