import React from "react";
import { NavigationProvider } from "../../providers/navigation.provider";

interface NavigationWrapperProps {
  children: React.ReactNode;
}

export default function NavigationWrapper({
  children,
}: NavigationWrapperProps) {
  return <NavigationProvider>{children}</NavigationProvider>;
}
