import { CreateLinkButton } from "@/components/ui/create-link-button";
import { toDateInputValue } from "@/lib/utils";

export function ReviewCreateButton() {
  const today = toDateInputValue(new Date());

  return (
    <CreateLinkButton
      href={`/reviews/new?date=${today}`}
      label="写今日复盘"
    />
  );
}
