import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldContent,
} from "@/components/ui/field";

export function FormShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Forms & Inputs</CardTitle>
        <CardDescription>
          Customized controls with depth and clarity.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-10">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="username">
              Username (Default - 32px)
            </FieldLabel>
            <Input id="username" placeholder="@johndoe" />
            <FieldDescription>Your public display name.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel>Combined Sizes (sm - 28px)</FieldLabel>
            <div className="flex gap-2">
              <Select defaultValue="en">
                <SelectTrigger size="sm" className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="vi">Vietnamese</SelectItem>
                </SelectContent>
              </Select>
              <Input size="sm" placeholder="Search..." className="flex-1" />
              <Button size="sm">Search</Button>
            </div>
          </Field>

          <Field>
            <FieldLabel>Learning Goal</FieldLabel>
            <RadioGroup defaultValue="daily" className="flex flex-row gap-3">
              <RadioGroupItem
                variant="card"
                value="casual"
                id="casual"
                className="flex-1"
              >
                <span className="font-bold">Casual</span>
                <span className="text-xs text-muted-foreground">5 mins</span>
              </RadioGroupItem>

              <RadioGroupItem
                variant="card"
                value="daily"
                id="daily"
                className="flex-1"
              >
                <span className="font-bold">Daily</span>
                <span className="text-xs text-muted-foreground">15 mins</span>
              </RadioGroupItem>

              <RadioGroupItem
                variant="card"
                value="pro"
                id="pro"
                className="flex-1"
              >
                <span className="font-bold">Pro</span>
                <span className="text-xs text-muted-foreground">30+ mins</span>
              </RadioGroupItem>
            </RadioGroup>
            <FieldDescription>
              Choose how much you want to practice.
            </FieldDescription>
          </Field>

          <Field orientation="horizontal" className="items-center">
            <Checkbox id="notifications" defaultChecked />
            <FieldLabel htmlFor="notifications" className="cursor-pointer">
              Enable Email Notifications
            </FieldLabel>
          </Field>

          <Field
            orientation="horizontal"
            className="border rounded-xl p-4 bg-muted/20"
          >
            <FieldContent>
              <FieldLabel htmlFor="dark-mode" className="cursor-pointer">
                Automatic Theme
              </FieldLabel>
              <FieldDescription>
                Sync with your system settings.
              </FieldDescription>
            </FieldContent>
            <Switch id="dark-mode" />
          </Field>

          <Field>
            <FieldLabel htmlFor="feedback">Optional Feedback</FieldLabel>
            <Textarea
              id="feedback"
              placeholder="Anything else we should know?"
              className="min-h-[100px]"
            />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
