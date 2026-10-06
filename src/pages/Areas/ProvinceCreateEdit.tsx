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
import { submitAdminResource } from "../../utils/adminForm";

export default function ProvinceCreateEdit() {
  if (Permission.check(["super_admin"]) === false) return <Navigate to={ROUTES.home} replace />;

  const { id } = useParams();
  const isUpdateMode = Boolean(id);
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(!isUpdateMode);
  const [form, setForm] = useState({ name: "", status: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isUpdateMode) {
      ApiRequest.call("api/admin/provinces/" + id, "GET").then((response) => {
        const data = response.data.province;
        setForm({
          name: data.name ?? "",
          status: Boolean(Number(data.status)),
        });
        setIsLoaded(true);
      });
    }
  }, [isUpdateMode, id]);

  const handleSubmit = async () => {
    if (!form.name) {
      ToastrNotification.error("نام استان الزامی است");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await submitAdminResource(
        isUpdateMode ? "api/admin/provinces/" + id : "api/admin/provinces",
        isUpdateMode,
        { name: form.name, status: form.status ? 1 : 0 }
      );
      if (response.success) navigate(ROUTES.provinceIndex);
      else ToastrNotification.error(response.message || "خطا در ذخیره استان");
    } catch (error) {
      console.log("error in ProvinceCreateEdit", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageMeta title={isUpdateMode ? "ویرایش استان" : "ایجاد استان"} />
      <PageBreadcrumb pageTitle={isUpdateMode ? "ویرایش استان" : "ایجاد استان"} />
      <ComponentCard title="اطلاعات استان">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label>نام استان</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          {isLoaded && (
            <div>
              <Label>وضعیت فعال</Label>
              <div className="mt-2">
                <Switch
                  key={`status-${form.status}`}
                  label="استان فعال است"
                  defaultChecked={form.status}
                  onChange={(checked) => setForm({ ...form, status: checked })}
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
