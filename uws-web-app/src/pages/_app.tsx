
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { DashboardProvider } from "@/components/dashboard/dashboard-context";
import "@/styles/globals.css";


const inter = Inter({ subsets: ["latin"] });

function AppBody({ children }: { children: React.ReactNode }) {
  return <div className={inter.className}>{children}</div>;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <DashboardProvider>
          <AppBody>
            <Component {...pageProps} />
          </AppBody>
        </DashboardProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
