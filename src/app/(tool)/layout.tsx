import {SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {Background} from "@/components/background";
import {Background as GradientBackground} from "@/components/grad-background/index";

const Layout = ({children}: {children: React.ReactNode}) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      {/* <SidebarTrigger /> */}
      {/* <Background /> */}
      <GradientBackground />
      <div className="relative z-10 w-full ">{children}</div>
    </SidebarProvider>
  );
};

export default Layout;
