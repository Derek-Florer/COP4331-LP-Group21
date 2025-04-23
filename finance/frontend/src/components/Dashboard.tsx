import * as React from "react";
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
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
import { Label as RechartLabel, PolarGrid, PolarRadiusAxis, PolarAngleAxis, RadialBar, RadialBarChart, } from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar";
import { format, parse } from "date-fns";
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
  //budget
  const [currentBudget, setCurrentBudget] = useState<number | null>(null);
  //transaction info
  const [payment, setPayment] = useState('');
  const [category, setCategory] = useState('');
  const [method, setMethod] = useState('');
  const [amount, setAmount] = useState('');
  //loading payments
  const [paymentList, setPaymentList] = useState<PaymentType[]>([]);
  const [paymentChanged, setPaymentChanged] = useState(false);
  //edit payments
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedPayment, setEditedPayment] = useState<any>({});
  //dialog
  const [open, setOpen] = useState(false);
  //date
  const now = new Date();
  const defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const [startDate, setStartDate] = React.useState<Date>(defaultStartDate);
  const [endDate, setEndDate] = React.useState<Date>(defaultEndDate);
  //chart
  const [totalSpent, setTotalSpent] = useState(0);


  const navigate = useNavigate();

  useEffect(() => {
    loadPayments();
  }, [startDate, endDate]);

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

  useEffect(() => {
    if (startDate) {
      // Set the end date to the last day of the month of the start date
      const lastDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      setEndDate(lastDayOfMonth);
    }
  }, [startDate]);

  const selectedMonth = startDate.getMonth() + 1; // getMonth() is 0-indexed
  const selectedYear = startDate.getFullYear();

  const fetchTotalSpent = async () => {
    if (!startDate || !endDate) return;

    const token = localStorage.getItem('token');
    let userId = '';
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        userId = decoded.userId;
      } catch (err) {
        console.error("Token decode error:", err);
        return;
      }
    }

    try {
      const res = await fetch('http://localhost:5000/api/totalSpent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, startDate, endDate }),
      });

      const data = await res.json();
      console.log(data);
      if (data.error) {
        console.error(data.error);
      } else {
        setTotalSpent(data.totalAmount || 0);
      }
    } catch (err) {
      console.error("Error fetching total spent:", err);
    }
  };
  useEffect(() => {
    fetchTotalSpent();  // Reset the flag after fetching data
  }, [startDate, endDate]);
  useEffect(() => {
    if (paymentChanged) {
      fetchTotalSpent();
      setPaymentChanged(false);  // Reset the flag after fetching data
    }
  }, [paymentChanged, startDate, endDate]);


  // Fetch and set current budget for selectedMonth and selectedYear
  useEffect(() => {
    const fetchBudget = async () => {
      const token = localStorage.getItem('token');
      let userId = '';
      if (token) {
        try {
          const decodedToken = jwtDecode<DecodedToken>(token);
          userId = decodedToken.userId;
        } catch (error) {
          console.error('Token error:', error);
          return;
        }
      }

      try {
        const response = await fetch('http://localhost:5000/api/getBudget', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            month: selectedMonth,
            year: selectedYear
          }),
        });

        const res = await response.json();
        setCurrentBudget(res.amount ?? 0); // fallback to 0
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    if (selectedMonth && selectedYear) {
      fetchBudget();
    }
  }, [selectedMonth, selectedYear]);


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
      setPaymentChanged(true);
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
      setPaymentChanged(true);
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
    let obj = {
      userId: userId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
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


  const handleSave = async (id: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/updatePayment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editedPayment, _id: id }),
      });
      const data = await res.json();
      if (!data.error) {
        // Optional: refetch or update paymentList
        setEditingId(null);
        fetchTotalSpent();
        loadPayments();
      }
    } catch (err) {
      console.error('Failed to save edit:', err);
    }
  };


  const spentRatio = currentBudget ? (totalSpent / currentBudget) : 0;
  const chartData = useMemo(() => [
    {
      browser: "safari",
      moneySpent: parseFloat((spentRatio * 100).toFixed(2)), // max 100%
      fill: "var(--color-safari)",
    },
  ], [spentRatio]);

  const chartConfig = {
    visitors: {
      label: "% spent",
    },
    safari: {
      label: "Safari",
      color: "hsl(var(--chart-2))",
    },
  };

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
                <CardTitle className="text-2xl text-muted-foreground/100">
                  Financial Report:
                  {selectedMonth ? (
                    <span className="px-2 text-foreground">
                      {new Date(0, selectedMonth - 1).toLocaleString("default", { month: "long" })}
                    </span>
                  ) : null}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  <span className="block text-xl font-medium text-muted-foreground pr-4">
                    Budget for this month:
                    {currentBudget !== null ? (
                      <span className="px-2 text-xl font-medium text-foreground pr-4">
                        ${currentBudget.toLocaleString()}
                      </span>) : 'Loading...'}
                  </span>
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
                        onSelect={(date) => { date && setStartDate(date) }}
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
                        selected={
                          startDate
                            ? new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0) // last day of the month
                            : endDate
                        }
                        onSelect={(date) => { date && setEndDate(date) }}
                        initialFocus
                        disabled={(date) =>
                          startDate
                            ? date.getMonth() !== startDate.getMonth() || date.getFullYear() !== startDate.getFullYear()
                            : false
                        }
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
                    startAngle={90}
                    endAngle={-270}
                    innerRadius={80}
                    outerRadius={105}
                    cx={100} // Moves chart left
                  >
                    <PolarGrid
                      gridType="circle"
                      radialLines={false}
                      stroke="none"
                      polarRadius={[76, 64]}
                    />
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]} // IMPORTANT: defines the 100% cap
                      angleAxisId={0}
                      tick={false}
                    />

                    <RadialBar
                      dataKey="moneySpent"
                      angleAxisId={0}
                      background
                      cornerRadius={10}
                    />
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
                                  ${totalSpent.toFixed(2)}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 20}
                                  className="fill-muted-foreground text-sm"
                                >
                                  Spent
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
                  <TableHead className="text-left">Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {[...paymentList].reverse().slice(0, 4).map((payment) => { //reverse list to show most recent transactions
                  const isEditing = editingId === payment._id;
                  return (
                    <TableRow key={payment._id} className="hover:bg-gray-200">
                      <TableCell className="font-medium">
                        {isEditing ? (
                          <Input
                            value={editedPayment.Payment}
                            onChange={(e) => setEditedPayment({ ...editedPayment, Payment: e.target.value })}
                            className="bg-white"
                          />
                        ) : (
                          payment.Payment
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editedPayment.Category}
                            onChange={(e) => setEditedPayment({ ...editedPayment, Category: e.target.value })}
                            className="bg-white"
                          />
                        ) : (
                          payment.Category
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editedPayment.Method}
                            onChange={(e) => setEditedPayment({ ...editedPayment, Method: e.target.value })}
                            className="bg-white"
                          />
                        ) : (
                          payment.Method
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing && editingId === payment._id ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "min-w-[140px] justify-start text-left font-mono bg-white",
                                  !editedPayment.CreatedAt && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {editedPayment.CreatedAt
                                  ? format(new Date(editedPayment.CreatedAt), "M/d/yyyy")
                                  : <span>Select date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={new Date(editedPayment.CreatedAt)}
                                onSelect={(date) => {
                                  if (date) {
                                    const isoString = date.toISOString();
                                    setEditedPayment({ ...editedPayment, CreatedAt: isoString });
                                  }
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        ) : (
                          format(new Date(payment.CreatedAt), "M/d/yyyy")
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editedPayment.Amount}
                            onChange={(e) => setEditedPayment({ ...editedPayment, Amount: e.target.value })}
                            className="bg-white"
                          />
                        ) : (
                          `$${Number(payment.Amount).toFixed(2)}`
                        )}
                      </TableCell>
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
                            {isEditing ? (
                              <>
                                <DropdownMenuItem onClick={() => handleSave(payment._id)}>Save</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEditingId(null)}>Cancel</DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingId(payment._id);
                                  setEditedPayment({ ...payment });
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive hover:text-destructive focus:text-destructive"
                              onClick={() => handleRemovePayment(payment._id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </main>
      </SidebarProvider>
    </div >
  );
};

export default Dashboard;