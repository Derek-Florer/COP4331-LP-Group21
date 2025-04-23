import { useState, useEffect } from "react";
import { format } from "date-fns";
import { jwtDecode } from "jwt-decode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboardSidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Ellipsis, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Command,
  CommandInput,
} from "@/components/ui/command";

interface PaymentType {
  _id: string;
  UserId: string;
  Payment: string;
  Category: string;
  Method: string;
  Amount: number;
  CreatedAt: string;
}

interface DecodedToken {
  userId: string;
}

export default function Payments() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [payments, setPayments] = useState<PaymentType[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedPayment, setEditedPayment] = useState<Partial<PaymentType>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [payment, setPayment] = useState('');
  const [category, setCategory] = useState('');
  const [method, setMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const paymentsPerPage = 10;

  const loadPayments = async () => {
    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 0);

    const token = localStorage.getItem('token');
    let userId = '';
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        userId = decoded.userId;
      } catch (err) {
        console.error("JWT Decode Error:", err);
      }
    }

    try {
      const res = await fetch("http://localhost:5000/api/loadPayments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      });
      const data = await res.json();
      setPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [selectedMonth, selectedYear]);

  const handleAddPayment = async (event: any) => {
    event.preventDefault();
    if (!payment || !category || !method || !amount) {
      alert('Please fill out all fields.');
      return;
    }

    const token = localStorage.getItem('token');
    let userId = '';
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        userId = decoded.userId;
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }

    const obj = {
      userId,
      payment,
      category,
      method,
      amount: parseFloat(amount),
    };

    try {
      const response = await fetch('http://localhost:5000/api/addPayment', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await response.json();
      if (res.error) {
        setMessage(res.error);
      } else {
        setMessage('Payment added!');
        setPayment('');
        setCategory('');
        setMethod('');
        setAmount('');
        setOpen(false);
        loadPayments();
      }
    } catch (error: any) {
      alert(error.toString());
    }
  };

  const handleSave = async (id: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/updatePayment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editedPayment, _id: id }),
      });
      const data = await res.json();
      if (!data.error) {
        setEditingId(null);
        const updated = payments.map(p => p._id === id ? { ...p, ...editedPayment } as PaymentType : p);
        setPayments(updated);
      }
    } catch (err) {
      console.error('Failed to save edit:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch('http://localhost:5000/api/removePayment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setPayments(payments.filter(p => p._id !== id));
    } catch (err) {
      console.error('Failed to delete payment:', err);
    }
  };

  const filteredPayments = payments.filter((p) =>
    p.Payment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString("default", {
    month: "long",
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="w-screen h-screen bg-muted font-sans text-foreground flex overflow-hidden">
      <SidebarProvider>
        <aside className={`bg-card border-r border-trans shadow-lg transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-0"} overflow-hidden`}>
          <AppSidebar />
        </aside>

        <SidebarTrigger onClick={toggleSidebar} />
        <main className={`flex-1 flex flex-col items-center justify-start p-8 overflow-y-auto transition-all duration-300 ${isSidebarOpen ? "" : "w-full"}`}>
          <div className="w-full max-w-5xl">
            <Card className="w-full shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl">
                  Payments for {monthName} {selectedYear}
                </CardTitle>
              </CardHeader>
              <CardContent>

                {/* Add Button */}
                <div className="flex justify-end mb-4">
                  <Button variant="outline" onClick={() => setOpen(true)}>Add Payment</Button>
                </div>

                {/* Add Payment Dialog */}
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add a payment.</DialogTitle>
                      <DialogDescription>Fill out the form to add a payment.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="payment" className="text-right">Payment</Label>
                        <Input value={payment} onChange={(e) => setPayment(e.target.value)} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Category</Label>
                        <Input value={category} onChange={(e) => setCategory(e.target.value)} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="method" className="text-right">Method</Label>
                        <Input value={method} onChange={(e) => setMethod(e.target.value)} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">Amount</Label>
                        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="submit" onClick={handleAddPayment}>Add</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Filter & Search */}
                <div className="flex gap-4 mb-6">
                  <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(Number(val))}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i} value={(i + 1).toString()}>
                          {new Date(0, i).toLocaleString("default", { month: "long" })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    min="2000"
                    max="2100"
                    className="w-[140px]"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    placeholder="Year"
                  />
                </div>

                {/* Search bar */}
                <Command className="mb-6 rounded-lg border shadow-md">
                  <CommandInput
                    placeholder="Search payments by name..."
                    onValueChange={(value) => {
                      setSearchTerm(value);
                      setCurrentPage(1);
                    }}
                  />
                </Command>

                {/* Payments Table */}
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="px-3 py-2 font-semibold">Payment</th>
                        <th className="px-3 py-2 font-semibold">Category</th>
                        <th className="px-3 py-2 font-semibold">Method</th>
                        <th className="px-3 py-2 font-semibold">Date</th>
                        <th className="px-1 py-2 font-semibold">Amount</th>
                        <th className="px-3 py-2 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPayments.length > 0 ? (
                        currentPayments.map((p) => {
                          const isEditing = editingId === p._id;
                          return (
                            <tr key={p._id} className="border-b">
                              <td className="px-3 py-2">{isEditing ? <Input value={editedPayment.Payment || ""} onChange={(e) => setEditedPayment({ ...editedPayment, Payment: e.target.value })} /> : p.Payment}</td>
                              <td className="px-3 py-2">{isEditing ? <Input value={editedPayment.Category || ""} onChange={(e) => setEditedPayment({ ...editedPayment, Category: e.target.value })} /> : p.Category}</td>
                              <td className="px-3 py-2">{isEditing ? <Input value={editedPayment.Method || ""} onChange={(e) => setEditedPayment({ ...editedPayment, Method: e.target.value })} /> : p.Method}</td>
                              <td className="px-3 py-2">
                                {isEditing ? (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" className={cn("min-w-[140px] justify-start text-left font-mono bg-white")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {editedPayment.CreatedAt ? format(new Date(editedPayment.CreatedAt), "M/d/yyyy") : <span>Select date</span>}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar
                                        mode="single"
                                        selected={editedPayment.CreatedAt ? new Date(editedPayment.CreatedAt) : new Date()}
                                        onSelect={(date) => {
                                          if (date) {
                                            setEditedPayment({ ...editedPayment, CreatedAt: date.toISOString() });
                                          }
                                        }}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                ) : (
                                  format(new Date(p.CreatedAt), "M/d/yyyy")
                                )}
                              </td>
                              <td className="px-1 py-2">
                                {isEditing ? (
                                  <Input type="number" value={editedPayment.Amount?.toString() || ""} onChange={(e) => setEditedPayment({ ...editedPayment, Amount: Number(e.target.value) })} />
                                ) : (
                                  `$${Number(p.Amount).toFixed(2)}`
                                )}
                              </td>
                              <td className="px-3 py-2 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Ellipsis className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuLabel>{p.Payment}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {isEditing ? (
                                      <>
                                        <DropdownMenuItem onClick={() => handleSave(p._id)}>Save</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setEditingId(null)}>Cancel</DropdownMenuItem>
                                      </>
                                    ) : (
                                      <DropdownMenuItem onClick={() => {
                                        setEditingId(p._id);
                                        setEditedPayment({ ...p });
                                      }}>
                                        Edit
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(p._id)}>Delete</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-3 py-4 text-muted-foreground text-center">
                            No matching payments found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {totalPages > 1 && (
                    <div className="mt-4 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                          <PaginationItem className="px-4 flex items-center">
                            Page {currentPage} of {totalPages}
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}
