"use client";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";

interface SocialButtonProps {
  onClick: () => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export function SocialButton({ onClick, isLoading, disabled, children }: SocialButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full flex items-center justify-center gap-2"
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? <LoadingSpinner size="sm" /> : children}
    </Button>
  );
}

interface GoogleButtonProps {
  onClick: () => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
}

export function GoogleButton({ onClick, isLoading, disabled }: GoogleButtonProps) {
  return (
    <SocialButton onClick={onClick} isLoading={isLoading} disabled={disabled}>
      {!isLoading && (
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      )}
      <span>Sign in with Google</span>
    </SocialButton>
  );
}

interface AppleButtonProps {
  onClick: () => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
}

export function AppleButton({ onClick, isLoading, disabled }: AppleButtonProps) {
  return (
    <SocialButton onClick={onClick} isLoading={isLoading} disabled={disabled}>
      {!isLoading && (
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.7023 0C15.0734 0.0942 13.2299 1.0545 12.1241 2.3818C11.1205 3.58 10.3462 5.2545 10.6391 6.9C12.4147 6.9471 14.2377 5.9636 15.3183 4.6364C16.3219 3.4182 17.0488 1.7671 16.7023 0Z" fill="currentColor" />
          <path d="M21.3853 8.3091C19.9699 6.5836 18.0418 5.6182 16.2187 5.6182C13.8427 5.6182 12.7369 6.8364 10.9613 6.8364C9.13861 6.8364 7.74043 5.6182 5.65318 5.6182C3.97704 5.6182 2.00177 6.7309 0.586602 8.6909C-1.30681 11.3673 -1.54262 16.5818 1.49731 21.1855C2.47809 22.8836 3.83338 24.7964 5.60028 24.8C7.27642 24.8036 7.74043 23.6327 10.9084 23.6255C14.0764 23.6182 14.4935 24.8036 16.1696 24.7964C17.9365 24.7927 19.3876 22.6909 20.3684 20.9964C21.0953 19.7782 21.3853 19.1673 21.9771 17.7818C17.9894 16.1309 17.3447 10.1455 21.3853 8.3091Z" fill="currentColor" />
        </svg>
      )}
      <span>Sign in with Apple</span>
    </SocialButton>
  );
}
