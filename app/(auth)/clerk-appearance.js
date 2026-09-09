// baseTheme and the palette now come from ClerkThemeProvider, which follows the
// active light/dark theme. Only the element classNames live here, and they use
// our CSS variables, so they work in both themes unchanged.
export const authAppearance = {
  elements: {
    card: "bg-bg-base shadow-none sm:bg-bg-base border-0 p-0 sm:p-0",
    headerTitle: "text-2xl font-bold text-text-primary",
    headerSubtitle: "text-text-secondary",
    socialButtonsBlockButton: 
      "bg-bg-elevated border border-border hover:bg-bg-surface hover:border-text-secondary transition-all text-text-primary rounded-[10px]",
    socialButtonsBlockButtonText: "font-medium",
    dividerLine: "bg-border",
    dividerText: "text-text-muted",
    formFieldLabel: "text-text-primary font-medium",
    formFieldInput: 
      "bg-bg-surface border-border text-text-primary focus:ring-1 focus:ring-accent focus:border-accent transition-all rounded-[10px]",
    formButtonPrimary: 
      "bg-accent hover:bg-accent-hover text-white shadow-[0_0_10px_rgba(139,92,246,0.2)] hover:shadow-[0_0_15px_rgba(167,139,250,0.4)] transition-all active:scale-[0.98] rounded-[10px]",
    footerActionText: "text-text-secondary",
    footerActionLink: "text-accent hover:text-accent-hover font-medium",
    identityPreviewText: "text-text-primary",
    identityPreviewEditButton: "text-accent hover:text-accent-hover",
    formFieldErrorText: "text-error mt-1",
    alertText: "text-error",
    alert: "bg-error/10 border-0 flex items-center p-3 rounded-[10px]",
    alertIcon: "text-error",
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    main: "gap-6",
    formFieldRow: "mb-4",
  },
};
