import type { AppProps } from "next/app";
import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { DashboardProvider } from "@/components/dashboard/dashboard-context";
import "@/styles/globals.css";
import { AuthProvider } from "@/hooks/useAuth";

const inter = Inter({ subsets: ["latin"] });

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function AppBody({ children }: { children: React.ReactNode }) {
  return <div className={inter.className}>{children}</div>;
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <AuthProvider>
      <ThemeProvider>
        <SidebarProvider>
          <DashboardProvider>
            <AppBody>
              {getLayout(<Component {...pageProps} />)}
            </AppBody>
          </DashboardProvider>
        </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
