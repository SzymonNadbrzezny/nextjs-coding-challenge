import "./globals.css";
import { UserStoreProvider } from "@/providers/userStoreProvider";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` antialiased flex`}
      >
        <UserStoreProvider>{children}</UserStoreProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
