import LoggedInName from '../components/LoggedInName';
import Dashboard from '../components/Dashboard'


const DashboardPage = () =>
{
    return(
        <div>
            <Dashboard />
            <LoggedInName />
        </div>
    );
}

export default DashboardPage;