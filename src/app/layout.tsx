import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Face Atlas | Atlas estetico interativo",
  description:
    "Uma experiencia 3D educativa para explorar regioes do rosto, anatomia e procedimentos esteticos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
