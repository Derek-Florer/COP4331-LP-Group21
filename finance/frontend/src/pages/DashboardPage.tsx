import LoggedInName from '../components/LoggedInName';
import Dashboard from '../components/Dashboard'
import "./DashboardPage.css"

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