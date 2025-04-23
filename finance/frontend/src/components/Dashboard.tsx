import * as React from "react";
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Ellipsis, Calendar as CalendarIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboardSidebar"
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Label as RechartLabel, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart, } from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";

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
  CreatedAt: string,
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
  //date
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();

  const navigate = useNavigate();

  useEffect(() => {
    loadPayments();
  }, []);

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
    if (success != null) {
      console.log("Payment added");
      loadPayments();
    }
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

  //radial chart info.
  const chartData = [
    { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  ]
  const chartConfig = {
    visitors: {
      label: "Visitors",
    },
    safari: {
      label: "Safari",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig

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

                <span className="text-lg font-medium text-muted-foreground pr-4">From</span>

                  {/* Start Date */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[220px] justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Start date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <span className="text-lg font-medium text-muted-foreground px-4">to</span>

                  {/* End Date */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[220px] justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>End date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto max-h-[220px] w-full flex items-center justify-center"
                >
                  <RadialBarChart
                    data={chartData}
                    startAngle={0}
                    endAngle={250}
                    innerRadius={70}
                    outerRadius={95}
                    cx={100} // Moves chart left
                  >
                    <PolarGrid
                      gridType="circle"
                      radialLines={false}
                      stroke="none"
                      polarRadius={[76, 64]}
                    />
                    <RadialBar dataKey="visitors" background cornerRadius={10} />
                    <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                      <RechartLabel
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className="fill-foreground text-2xl font-bold"
                                >
                                  {chartData[0].visitors.toLocaleString()}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 20}
                                  className="fill-muted-foreground text-sm"
                                >
                                  Visitors
                                </tspan>
                              </text>
                            )
                          }
                        }}
                      />
                    </PolarRadiusAxis>
                  </RadialBarChart>
                </ChartContainer>
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

