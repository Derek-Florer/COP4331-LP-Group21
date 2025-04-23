import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Home, DollarSign, LogOutIcon, Wallet } from "lucide-react"
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface DecodedToken {
  userId: string,
  firstName: string,
}

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Payments",
    url: "/payments",
    icon: DollarSign,
  },
  {
    title: "Set budget",
    url: "/dashboard",
    icon: Wallet,
  },
  {
    title: "Logout",
    icon: LogOutIcon,
  },

]

export function AppSidebar() {

  const [openBudgetDialog, setOpenBudgetDialog] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number | string>(new Date().getFullYear());;
  const [budgetAmount, setBudgetAmount] = useState<number>(0);
  const [budgetInput, setBudgetInput] = useState(""); // For the formatted display

  const navigate = useNavigate();
  const handleLogout = () => {
    // Clear user data
    //localStorage.removeItem('user_data');
    localStorage.clear(); // clear everything

    navigate('/');
  };

  const handleAddBudget = async (event: any) => {
    event.preventDefault();
    if (!selectedMonth || !selectedYear || !budgetAmount) {
      alert("Please fill out all fields.");
      return;
    }
    const success = await addBudget(event);
    setOpenBudgetDialog(false);
    if (success != null)
      console.log("Budget added");
  };
  async function addBudget(event: any): Promise<void> {
    event.preventDefault();
    const token = localStorage.getItem('token');
    let userId = "";
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        userId = decodedToken.userId;
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
    const obj = {
      userId: userId,
      month: selectedMonth,
      year: selectedYear,
      amount: budgetAmount,
    };
    const js = JSON.stringify(obj);
    try {
      const response = await fetch("http://localhost:5000/api/addBudget", {
        method: "POST",
        body: js,
        headers: { "Content-Type": "application/json" },
      });

      const res = JSON.parse(await response.text());

      if (res.error) {
        console.log(res.error);
      } else {
        console.log("Budget added!");
      }
    } catch (error: any) {
      alert(error.toString());
    }
  }

  return (
    <>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              <div className="flex items-center gap-2">
                <span>Navigate</span>
                {/*<SidebarTrigger className="p-0 w-6 h-6" />*/}
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        className="cursor-pointer"
                        onClick={() => {
                          if (item.title === "Logout") {
                            handleLogout();
                          } else if (item.title === "Set budget") {
                            setOpenBudgetDialog(true);
                          } else if (item.url) {
                            navigate(item.url);
                          }
                        }}
                      >


                        <item.icon className={item.title === "Logout" ? "text-destructive" : "text-foreground"} />
                        <span className={item.title === "Logout" ? "text-destructive" : ""}>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <Dialog open={openBudgetDialog} onOpenChange={setOpenBudgetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Budget</DialogTitle>
            <DialogDescription>Select the month and enter your budget.</DialogDescription>
          </DialogHeader>

          <div className="flex space-y-4">
            <Select onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Select a month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }).map((_, i) => (
                  <SelectItem key={i} value={`${i + 1}`}>
                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              placeholder="Enter year"
              min="1900"
              max="2100"
              className="w-[140px]"
            />
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <Input
              type="text"
              placeholder="Enter budget amount"
              className="pl-6" // Adds space for the dollar sign
              value={budgetInput}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, ""); // Remove commas and $
                if (!/^\d*$/.test(raw)) return;

                const numeric = raw === "" ? 0 : Number(raw);
                const formatted = raw === "" ? "" : numeric.toLocaleString();

                setBudgetAmount(numeric);
                setBudgetInput(formatted);
              }}
            />
          </div>

          <DialogFooter>
            <Button onClick={handleAddBudget}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >
    </>
  )
}