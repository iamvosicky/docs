import { SignIn } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        baseTheme: dark,
        elements: {
          rootBox: 'mx-auto',
          card: 'bg-card border border-border shadow-lg rounded-2xl',
          headerTitle: 'text-foreground',
          headerSubtitle: 'text-muted-foreground',
          socialButtonsBlockButton: 'bg-secondary border-border text-foreground hover:bg-accent',
          formFieldInput: 'bg-background border-border text-foreground rounded-xl',
          formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl',
          footerActionLink: 'text-primary hover:text-primary/80',
          identityPreviewEditButton: 'text-primary',
          formFieldLabel: 'text-muted-foreground',
          dividerLine: 'bg-border',
          dividerText: 'text-muted-foreground',
        },
        variables: {
          borderRadius: '0.75rem',
        },
      }}
    />
  );
}
