import { Home, DollarSign, LogOutIcon } from "lucide-react"
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarTrigger,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Payments",
    url: "/subscription",
    icon: DollarSign,
  },
  {
    title: "Logout",
    icon: LogOutIcon,
  },

]

export function AppSidebar() {

  const navigate = useNavigate();
  const handleLogout = () => {
    // Clear user data
    //localStorage.removeItem('user_data');
    localStorage.clear(); // clear everything

    navigate('/');
  };

  return (
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
                      href={item.url}
                      onClick={item.title === "Logout" ? handleLogout : (e) => e.preventDefault()}
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
  )
}