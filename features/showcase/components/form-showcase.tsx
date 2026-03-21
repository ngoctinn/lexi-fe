import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field";

export function FormShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Forms & Inputs</CardTitle>
        <CardDescription>Customized controls with depth and clarity.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-10">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input id="username" placeholder="@johndoe" />
            <FieldDescription>Your public display name.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel>Learning Goal</FieldLabel>
            <RadioGroup defaultValue="daily" className="flex flex-col gap-3">
              <Field orientation="horizontal" className="relative">
                <RadioGroupItem value="casual" id="casual" className="peer sr-only" />
                <FieldLabel
                  htmlFor="casual"
                  className="flex flex-1 cursor-pointer flex-col p-4 rounded-xl border border-input transition-all peer-data-checked:border-primary peer-data-checked:bg-muted/40 hover:bg-muted/50"
                >
                  <span className="font-bold">Casual</span>
                  <span className="text-xs text-muted-foreground">5 minutes a day</span>
                </FieldLabel>
              </Field>

              <Field orientation="horizontal" className="relative">
                <RadioGroupItem value="daily" id="daily" className="peer sr-only" />
                <FieldLabel
                  htmlFor="daily"
                  className="flex flex-1 cursor-pointer flex-col p-4 rounded-xl border border-input transition-all peer-data-checked:border-primary peer-data-checked:bg-muted/40 hover:bg-muted/50"
                >
                  <span className="font-bold">Daily</span>
                  <span className="text-xs text-muted-foreground">15 minutes a day</span>
                </FieldLabel>
              </Field>

              <Field orientation="horizontal" className="relative">
                <RadioGroupItem value="pro" id="pro" className="peer sr-only" />
                <FieldLabel
                  htmlFor="pro"
                  className="flex flex-1 cursor-pointer flex-col p-4 rounded-xl border border-input transition-all peer-data-checked:border-primary peer-data-checked:bg-muted/40 hover:bg-muted/50"
                >
                  <span className="font-bold">Pro</span>
                  <span className="text-xs text-muted-foreground">30+ minutes a day</span>
                </FieldLabel>
              </Field>
            </RadioGroup>
            <FieldDescription>Choose how much you want to practice.</FieldDescription>
          </Field>

          <Field orientation="horizontal" className="items-center">
            <Checkbox id="notifications" defaultChecked />
            <FieldLabel htmlFor="notifications" className="cursor-pointer">Enable Email Notifications</FieldLabel>
          </Field>

          <Field orientation="horizontal" className="border rounded-xl p-4 bg-muted/20">
            <FieldContent>
              <FieldLabel htmlFor="dark-mode" className="cursor-pointer">Automatic Theme</FieldLabel>
              <FieldDescription>Sync with your system settings.</FieldDescription>
            </FieldContent>
            <Switch id="dark-mode" />
          </Field>

          <Field>
            <FieldLabel htmlFor="feedback">Optional Feedback</FieldLabel>
            <Textarea id="feedback" placeholder="Anything else we should know?" className="min-h-[100px]" />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
