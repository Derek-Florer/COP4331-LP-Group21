import * as React from "react";
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Ellipsis, Calendar as CalendarIcon, Beef, HousePlus, Cable, Car, UtensilsCrossed, TvMinimalPlay, Cross, PiggyBank } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboardSidebar"
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Label as RechartLabel, LabelList, PolarGrid, PolarRadiusAxis, PolarAngleAxis, RadialBar, RadialBarChart, Pie, PieChart, Cell } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar";
import { format, parse } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip } from "@/components/ui/tooltip";


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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
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
      createdAt: selectedDate,
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

  //radial chart
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


  //piechart
  const categoryData = [
    "Groceries", "Rent", "Utilities", "Transportation", "Dining",
    "Healthcare", "Entertainment", "Subscriptions", "Education", "Savings", "Other"
  ];
  const [categoryTotals, setCategoryTotals] = useState<any[]>([]);
  const pieTotal = categoryTotals.reduce((sum, entry) => sum + entry.value, 0);
  const fetchSpentPerCategory = async (category: string): Promise<number> => {
    const token = localStorage.getItem('token');
    let userId = '';
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        userId = decodedToken.userId;
      } catch (error) {
        console.error('Token error:', error);
        return 0;
      }
    }
    try {
      const res = await fetch('http://localhost:5000/api/spendingByCategory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, startDate, endDate, userId }),
      });
      const data = await res.json();
      if (data.error) {
        console.error(`Error for category ${category}:`, data.error);
        return 0;
      }
      return data.totalAmount || 0;
    } catch (err) {
      console.error(`Fetch error for category ${category}:`, err);
      return 0;
    }
  };
  const getCategoryData = async () => {
    // Fetch category spending data in parallel
    if (totalSpent === 0) {
      console.error("Total spent is 0, cannot calculate percentages.");
      const nullCategoryValues = [{ category: "none", value: 100 }];
      setCategoryTotals(nullCategoryValues);
      return;
    }
    const categoryValues = await Promise.all(
      categoryData.map(async (category) => {
        const categorySpent = await fetchSpentPerCategory(category);
        if (categorySpent === 0) return null; // Skip if there's no spending for this category
        const percentage = (categorySpent / totalSpent) * 100;
        return { category, value: percentage };
      })
    );
    // Filter out any null values (categories with zero spending)
    const filteredCategoryValues = categoryValues.filter((entry) => entry !== null);
    setCategoryTotals(filteredCategoryValues);
  };

  useEffect(() => {
    getCategoryData();
    console.log(categoryTotals)
  }, [totalSpent]);

  const categoryColors = {
    Groceries: "#1B6CA8",         // Deep Ocean Blue
    Rent: "#0077B6",              // Blue Sea
    Utilities: "#0096C7",         // Caribbean Blue
    Transportation: "#00B4D8",    // Bright Cyan
    Dining: "#48CAE4",            // Aqua Sky
    Healthcare: "#90E0EF",        // Light Aqua
    Entertainment: "#ADE8F4",     // Pale Blue
    Subscriptions: "#CAF0F8",     // Very Light Blue
    Education: "#1864AB",         // Steel Blue
    Savings: "#144E75",           // Slate Blue
    Other: "#0D3B66",              // Dark Ocean Navy
    none: "gray"
  };


  //category icons
  const categoryIcons: Record<string, React.ReactNode> = {
    Groceries: <Beef className="mr-2 h-4 w-4 inline" />,
    Rent: <HousePlus className="mr-2 h-4 w-4 inline" />,
    Utilities: <Cable className="mr-2 h-4 w-4 inline" />,
    Transportation: <Car className="mr-2 h-4 w-4 inline" />,
    Dining: <UtensilsCrossed className="mr-2 h-4 w-4 inline" />,
    Entertainment: <TvMinimalPlay className="mr-2 h-4 w-4 inline" />,
    Healthcare: <Cross className="mr-2 h-4 w-4 inline" />,
    Savings: <PiggyBank className="mr-2 h-4 w-4 inline" />,
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
              <CardContent className="flex-1 pb-0 flex flex-row items-center ">
                <span className="w-full max-w-[50%]">
                  <h3 className="text-lg text-center font-semibold mb-2 text-muted-foreground">Total Spent</h3>
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
                              );
                            }
                          }}
                        />
                      </PolarRadiusAxis>
                    </RadialBarChart>
                  </ChartContainer>
                  <div className="text-center mt-4">
                    <p className="text-sm text-muted-foreground">
                      {(((currentBudget ? currentBudget : 0) - totalSpent)).toFixed(2)}$ left to spend.
                    </p>
                  </div>
                </span>

                {/* Pie chart on the right side */}
                <span className="w-full max-w-[50%]">
                  <h3 className="text-lg text-center font-semibold mb-2 text-muted-foreground">Total Spent by Category</h3>
                  <ChartContainer
                    config={chartConfig}
                    className="mx-auto max-h-[400px] w-full flex items-center justify-center"
                  >
                    <PieChart width={600} height={400}>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={categoryTotals}
                        dataKey="value"
                        nameKey="category"
                        cx="50%" // Center the pie chart horizontally
                        cy="50%" // Center the pie chart vertically
                        innerRadius={0}
                        outerRadius={85}
                      >
                        {categoryTotals.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={categoryColors[entry.category as keyof typeof categoryColors] || "#8884d8"}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  <div className="mt-4 px-4">
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 max-w-full">
                      {categoryTotals.map((entry, index) => {
                        const percent = ((entry.value / pieTotal) * 100).toFixed(2);
                        return (
                          <div key={`legend-${index}`} className="flex items-center">
                            <span
                              className="block w-4 h-4 rounded-sm"
                              style={{
                                backgroundColor:
                                  categoryColors[entry.category as keyof typeof categoryColors] || "#8884d8",
                              }}
                            />
                            <span className="ml-2 text-sm text-muted-foreground whitespace-nowrap">
                              {entry.category} – {percent}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </span>
              </CardContent>
              <CardFooter />
            </Card>
          </div>

          <div className="w-full max-w-4xl space-y-8 pt-8">
            {/* Invoice Table */}
            <Table className="w-full">
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
                        <Label htmlFor="payment" className="text-right">Description</Label>
                        <Input
                          onChange={(e) => setPayment(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Category</Label>
                        <Select onValueChange={setCategory}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Groceries"><Beef />Groceries</SelectItem>
                            <SelectItem value="Rent"><HousePlus />Rent</SelectItem>
                            <SelectItem value="Utilities"><Cable />Utilities</SelectItem>
                            <SelectItem value="Transportation"><Car />Transportation</SelectItem>
                            <SelectItem value="Dining"><UtensilsCrossed />Dining</SelectItem>
                            <SelectItem value="Entertainment"><TvMinimalPlay />Entertainment</SelectItem>
                            <SelectItem value="Healthcare"><Cross />Healthcare</SelectItem>
                            <SelectItem value="Savings"><PiggyBank />Savings</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="createdAt" className="text-right">Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="justify-start text-left font-normal col-span-3"
                            >
                              {selectedDate ? format(selectedDate, "MM/dd/yyyy") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
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
                  <TableHead className="w-[100px]">Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentList.map((payment) => {
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
                          <Select
                            value={editedPayment.Category}
                            onValueChange={(value) =>
                              setEditedPayment({ ...editedPayment, Category: value })
                            }
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Groceries">
                                <div className="flex items-center gap-2">
                                  <Beef className="h-4 w-4" />
                                  Groceries
                                </div>
                              </SelectItem>
                              <SelectItem value="Rent">
                                <div className="flex items-center gap-2">
                                  <HousePlus className="h-4 w-4" />
                                  Rent
                                </div>
                              </SelectItem>
                              <SelectItem value="Utilities">
                                <div className="flex items-center gap-2">
                                  <Cable className="h-4 w-4" />
                                  Utilities
                                </div>
                              </SelectItem>
                              <SelectItem value="Transportation">
                                <div className="flex items-center gap-2">
                                  <Car className="h-4 w-4" />
                                  Transportation
                                </div>
                              </SelectItem>
                              <SelectItem value="Dining">
                                <div className="flex items-center gap-2">
                                  <UtensilsCrossed className="h-4 w-4" />
                                  Dining
                                </div>
                              </SelectItem>
                              <SelectItem value="Entertainment">
                                <div className="flex items-center gap-2">
                                  <TvMinimalPlay className="h-4 w-4" />
                                  Entertainment
                                </div>
                              </SelectItem>
                              <SelectItem value="Healthcare">
                                <div className="flex items-center gap-2">
                                  <Cross className="h-4 w-4" />
                                  Healthcare
                                </div>
                              </SelectItem>
                              <SelectItem value="Savings">
                                <div className="flex items-center gap-2">
                                  <PiggyBank className="h-4 w-4" />
                                  Savings
                                </div>
                              </SelectItem>
                              <SelectItem value="Other">
                                <div className="flex items-center gap-2">
                                  Other
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="flex items-center gap-2">
                            {categoryIcons[payment.Category] || null}
                            <span>{payment.Category}</span>
                          </div>
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

