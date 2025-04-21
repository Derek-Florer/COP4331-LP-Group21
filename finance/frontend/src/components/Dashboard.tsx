import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Ellipsis } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboardSidebar"
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"

interface DecodedToken {
  userId: string,
  firstName: string,
}

interface PaymentType {
  _id: string;
  UserId: string,
  Payment: string,
  Category: string,
  Method: string,
  Amount: number,
}

function Dashboard() {

  const [message, setMessage] = useState('');
  const [firstName, setFirstName] = useState('')
  //transaction info
  const [payment, setPayment] = useState('');
  const [category, setCategory] = useState('');
  const [method, setMethod] = useState('');
  const [amount, setAmount] = useState('');
  //loading payments
  const [paymentList, setPaymentList] = useState<PaymentType[]>([]);
  //dialog
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        setFirstName(decodedToken.firstName);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
  }, []);

  const handleSubscription = () => {
    navigate('/subscriptions');
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleOpenDialog = () => {
    setOpen(true);
  }
  const handleCloseDialog = () => {
    setOpen(false);
  }

  const handleAddPayment = async (event: any) => {
    event.preventDefault();
    // Validate inputs
    if (!payment || !category || !method || !amount) {
      alert('Please fill out all fields.');
      return;
    }
    const success = addPayment(event)
    handleCloseDialog();
    if (success != null)
      console.log("Payment added")
  };
  async function addPayment(event: any): Promise<void> {
    event.preventDefault();
    const token = localStorage.getItem('token');
    let userId = ""
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        userId = decodedToken.userId;
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
    const obj = {
      userId: userId,
      payment: payment,
      category: category,
      method: method,
      amount: amount,
    };
    const js = JSON.stringify(obj);
    try {
      const response = await fetch('http://localhost:5000/api/addPayment', {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }
      });
      const res = JSON.parse(await response.text());
      //const refresh = await loadSubscriptions();
      if (res.error) {
        setMessage(res.error);
      } else {
        setMessage('payment Added!');
        loadPayments();
      }
    } catch (error: any) {
      alert(error.toString());
    }
  }


  const handleRemovePayment = async (id: string) => {

    let obj = { id: id };
    let js = JSON.stringify(obj);

    try {
      const response = await fetch(`http://localhost:5000/api/removePayment`,
        {
          method: 'POST', body: js, headers: {
            'Content-Type':
              'application/json'
          }
        });

      const refresh = await loadPayments();

      const data = await response.json();
      console.log("subscription removed");
    } catch (error) {
      console.error('Request error:', error);
    }
  };


  const loadPayments = async () => {
    const token = localStorage.getItem('token');
    let userId = ""
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        userId = decodedToken.userId;
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
    let obj = { userId: userId };
    let js = JSON.stringify(obj);
    try {
      const response = await
        fetch('http://localhost:5000/api/loadPayments',
          {
            method: 'POST', body: js, headers: {
              'Content-Type':
                'application/json'
            }
          });

      const data = await response.json();
      console.log(data);
      setPaymentList(data);
    }
    catch (error: any) {
      alert(error.toString());
    }
  }
  useEffect(() => {
    loadPayments();
  }, []);

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
                {/* Add a payment */}
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={handleOpenDialog}>Add</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add a payment.</DialogTitle>
                      <DialogDescription>
                        Add a payment please.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="payment" className="text-right">Payment</Label>
                        <Input
                          onChange={(e) => setPayment(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Category</Label>
                        <Input
                          onChange={(e) => setCategory(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="method" className="text-right">Method</Label>
                        <Input
                          onChange={(e) => setMethod(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">Amount</Label>
                        <Input
                          type="number"
                          onChange={(e) => setAmount(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="submit" onClick={handleAddPayment}>Add</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <TableRow>
                  <TableHead className="w-[100px]">Payment</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentList.map((payment) => (
                  <TableRow key={payment._id} className="hover:bg-gray-200">
                    <TableCell className="font-medium">{payment.Payment}</TableCell>
                    <TableCell>{payment.Category}</TableCell>
                    <TableCell>{payment.Method}</TableCell>
                    <TableCell className="text-right">${Number(payment.Amount).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="focus:outline-none focus:ring-0">
                            <Ellipsis className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>{payment.Payment}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem
                            className='text-destructive hover:text-destructive focus:text-destructive'
                            onClick={() => handleRemovePayment(payment._id)}>
                            Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>
      </SidebarProvider>
    </div >
  );
};

export default Dashboard;

