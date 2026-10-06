import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Switch from "../../components/form/switch/Switch";
import Button from "../../components/ui/button/Button";
import ApiRequest from "../../classes/ApiRequest";
import ToastrNotification from "../../classes/ToastrNotification";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../../routes";
import { Permission } from "../../classes/Permission.ts";
import { selectClassName, submitAdminResource } from "../../utils/adminForm";

const STYLES = [
  { value: "table", label: "جدول" },
  { value: "line", label: "خطی" },
  { value: "slider", label: "اسلایدر" },
  { value: "box3", label: "باکس ۳ تایی" },
  { value: "box4", label: "باکس ۴ تایی" },
];

export default function SectionCreateEdit() {
  if (Permission.check(["super_admin"]) === false) return <Navigate to={ROUTES.home} replace />;

  const { id } = useParams();
  const isUpdateMode = Boolean(id);
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(!isUpdateMode);
  const [form, setForm] = useState({
    title: "",
    style: "slider",
    priority: 1,
    link: "",
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isUpdateMode) {
      ApiRequest.call("api/admin/sections/" + id, "GET").then((response) => {
        const data = response.data.homeSection;
        setForm({
          title: data.title ?? "",
          style: data.style ?? "slider",
          priority: data.priority ?? 1,
          link: data.link ?? "",
          is_active: Boolean(Number(data.is_active)),
        });
        setIsLoaded(true);
      });
    }
  }, [isUpdateMode, id]);

  const handleSubmit = async () => {
    if (!form.title) {
      ToastrNotification.error("عنوان سکشن الزامی است");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title,
        style: form.style,
        priority: form.priority,
        link: form.link,
        is_active: form.is_active ? 1 : 0,
      };
      const response = await submitAdminResource(
        isUpdateMode ? "api/admin/sections/" + id : "api/admin/sections",
        isUpdateMode,
        payload
      );
      if (response.success) navigate(ROUTES.sectionIndex);
      else ToastrNotification.error(response.message || "خطا در ذخیره سکشن");
    } catch (error) {
      console.log("error in SectionCreateEdit", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageMeta title={isUpdateMode ? "ویرایش سکشن" : "ایجاد سکشن"} />
      <PageBreadcrumb pageTitle={isUpdateMode ? "ویرایش سکشن" : "ایجاد سکشن"} />
      <ComponentCard title="اطلاعات سکشن صفحه اصلی">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label>عنوان</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>استایل</Label>
            <select className={selectClassName} value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })}>
              {STYLES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>اولویت</Label>
            <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} />
          </div>
          <div>
            <Label>لینک</Label>
            <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="اختیاری" />
          </div>
          {isLoaded && (
            <div>
              <Label>وضعیت فعال</Label>
              <div className="mt-2">
                <Switch
                  key={`is_active-${form.is_active}`}
                  label="سکشن فعال است"
                  defaultChecked={form.is_active}
                  onChange={(checked) => setForm({ ...form, is_active: checked })}
                />
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <Button variant="success" size="md" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </div>
      </ComponentCard>
    </div>
  );
}
