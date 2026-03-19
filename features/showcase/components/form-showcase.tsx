import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";

export function FormShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Forms & Inputs</CardTitle>
        <CardDescription>Input fields and toggles.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input id="username" placeholder="@johndoe" />
          </Field>
          
          <Field>
            <FieldLabel htmlFor="difficulty">Difficulty Level</FieldLabel>
            <Select>
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="feedback">Feedback</FieldLabel>
            <Textarea id="feedback" placeholder="Share your thoughts..." className="min-h-[80px]" />
          </Field>

          <Field orientation="horizontal" className="border rounded-lg p-4 bg-muted/20">
            <div className="flex flex-col gap-0.5">
              <FieldLabel htmlFor="dark-mode" className="cursor-pointer">Dark Mode</FieldLabel>
              <FieldDescription>Toggle theme variation.</FieldDescription>
            </div>
            <Switch id="dark-mode" />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
