import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboardSidebar"
import { Button } from '@/components/ui/button';

function Dashboard() {

  const [message, setMessage] = useState('');
  const [, setSubscriptionName] = useState('');
  const [price, setPrice] = useState('');

  const navigate = useNavigate();

  const userDataString = localStorage.getItem('user_data');
  let firstName = '';
  if (userDataString) {
    try {
      const userData = JSON.parse(userDataString);
      firstName = userData.firstName;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
    }
  }

  const handleSubscription = () => {
    navigate('/subscriptions');
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="w-screen h-screen bg-muted font-sans text-foreground flex overflow-hidden">
      <SidebarProvider >
        {/* Sidebar */}
        <aside
          className={
            `bg-card border-r border-trans shadow-lg transition-all duration-300 
            ${isSidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`
          }>
          <AppSidebar />
        </aside>

        {/* Main content area */}
        <SidebarTrigger onClick={toggleSidebar} />
        <main
          className={
            `flex-1 flex flex-col items-center justify-start p-8 overflow-y-auto transition-all duration-300 
            ${isSidebarOpen ? '' : 'w-full'}`
          }> {/* Trigger to toggle sidebar */}

          <div className="w-full max-w-2xl space-y-8">
            {/* Greeting */}
            <h1 className="text-3xl font-bold text-primary">
              Hi, <span className="text-foreground/70">{firstName}</span>!
            </h1>

            {/* Report Card */}
            <Card className="shadow-xl border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-2xl">Monthly Report</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Start Month – End Month
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-foreground">Card Content</p>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">Card Footer</p>
              </CardFooter>
            </Card>

            {/* Invoice Table */}
            <Table>
              <TableCaption>A list of your recent transactions.</TableCaption>
              <TableHeader>
                <h2 className="text-xl font-semibold whitespace-nowrap">Recent Transactions</h2>
                <Button className="h-3 px-3 text-sm">Add</Button>
                <TableRow>
                  <TableHead className="w-[100px]">Payment</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Mcdonalds</TableCell>
                  <TableCell>Food</TableCell>
                  <TableCell>Credit Card</TableCell>
                  <TableCell className="text-right">$250.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </main>
      </SidebarProvider>
    </div >
  );
};

export default Dashboard;

