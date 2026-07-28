export function getInitials(name?: string | null): string {
  const normalizedName = name?.trim();

  if (!normalizedName) {
    return "U";
  }

  const nameParts = normalizedName.split(/\s+/).filter(Boolean);

  if (nameParts.length === 1) {
    return nameParts[0].slice(0, 2).toUpperCase();
  }

  const firstInitial = nameParts[0]?.charAt(0) ?? "";
  const lastInitial = nameParts.at(-1)?.charAt(0) ?? "";

  return `${firstInitial}${lastInitial}`.toUpperCase() || "U";
}