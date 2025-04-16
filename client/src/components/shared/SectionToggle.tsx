import { useTheme } from "@/contexts/ThemeContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Briefcase, GraduationCap } from "lucide-react";

export default function SectionToggle() {
  const { activeSection, setActiveSection } = useTheme();

  const handleToggle = () => {
    setActiveSection(activeSection === "academic" ? "professional" : "academic");
  };

  return (
    <div className="flex items-center space-x-2">
      <GraduationCap className={`h-4 w-4 ${activeSection === "academic" ? "text-primary" : "text-muted-foreground"}`} />
      
      <Switch
        checked={activeSection === "professional"}
        onCheckedChange={handleToggle}
        id="section-toggle"
      />
      
      <Label htmlFor="section-toggle" className="cursor-pointer">
        <Briefcase className={`h-4 w-4 ${activeSection === "professional" ? "text-primary" : "text-muted-foreground"}`} />
      </Label>
    </div>
  );
}
