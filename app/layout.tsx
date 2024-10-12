import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Free AI-Powered Docker File Generator",
  description: "Generate Free Dockerfiles for your GitHub repositories using AI.",
  keywords: "Docker, AI, GitHub, Dockerfile, Generator",
  authors: [{ name: "Saurabh Udupi" }],
  openGraph: {
    title: "AI-Powered Docker File Generator",
    description: "Generate Dockerfiles for your GitHub repositories using AI.",
    url: "https://docker-ai.vercel.app",
    images: [
      {
        url: "https://repository-images.githubusercontent.com/871184908/663f611e-a14b-4858-a124-c16cacce16df",
        width: 800,
        height: 600,
        alt: "DockerAI Logo",
      },
    ],
    siteName: "DockerAI",
  },
  twitter: {
    card: "summary_large_image",
    site: "https://docker-ai.vercel.app",
    title: "Free AI-Powered Docker File Generator",
    description: "Generate Free Dockerfiles for your GitHub repositories using AI.",
    images: "https://repository-images.githubusercontent.com/871184908/663f611e-a14b-4858-a124-c16cacce16df",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}