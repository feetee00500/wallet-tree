import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const OverviewIcon = (props: IconProps) => (
  <Icon {...props}><path d="M4 13h6V4H4v9Zm10 7h6v-9h-6v9ZM4 20h6v-3H4v3Zm10-13h6V4h-6v3Z" /></Icon>
);
export const TransactionsIcon = (props: IconProps) => (
  <Icon {...props}><path d="M7 7h11m0 0-3-3m3 3-3 3M17 17H6m0 0 3 3m-3-3 3-3" /></Icon>
);
export const AnalyticsIcon = (props: IconProps) => (
  <Icon {...props}><path d="M5 20V10m7 10V4m7 16v-7" /></Icon>
);
export const CategoriesIcon = (props: IconProps) => (
  <Icon {...props}><path d="m4 4 6 .2 10 10-5.8 5.8-10-10L4 4Z" /><path d="M8 8h.01" /></Icon>
);
export const AccountIcon = (props: IconProps) => (
  <Icon {...props}><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></Icon>
);
export const PlusIcon = (props: IconProps) => (
  <Icon {...props}><path d="M12 5v14M5 12h14" /></Icon>
);
export const ArrowUpIcon = (props: IconProps) => (
  <Icon {...props}><path d="m6 15 6-6 6 6" /></Icon>
);
export const ArrowDownIcon = (props: IconProps) => (
  <Icon {...props}><path d="m6 9 6 6 6-6" /></Icon>
);
export const SearchIcon = (props: IconProps) => (
  <Icon {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Icon>
);
export const ChevronLeftIcon = (props: IconProps) => (
  <Icon {...props}><path d="m15 18-6-6 6-6" /></Icon>
);
export const ChevronRightIcon = (props: IconProps) => (
  <Icon {...props}><path d="m9 18 6-6-6-6" /></Icon>
);
export const TrashIcon = (props: IconProps) => (
  <Icon {...props}><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" /></Icon>
);
export const EditIcon = (props: IconProps) => (
  <Icon {...props}><path d="m4 20 4.2-1 10-10-3.2-3.2-10 10L4 20Z" /><path d="m13.5 7.5 3 3" /></Icon>
);
export const LogoutIcon = (props: IconProps) => (
  <Icon {...props}><path d="M10 17 15 12 10 7M15 12H3m11-9h6v18h-6" /></Icon>
);
