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
import { rowsFrom, selectClassName, submitAdminResource } from "../../utils/adminForm";

export default function CityCreateEdit() {
  if (Permission.check(["super_admin"]) === false) return <Navigate to={ROUTES.home} replace />;

  const { id } = useParams();
  const isUpdateMode = Boolean(id);
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(!isUpdateMode);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", province_id: "", status: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    ApiRequest.call("api/admin/provinces", "GET").then((response) => setProvinces(rowsFrom(response, "provinces")));
    if (isUpdateMode) {
      ApiRequest.call("api/admin/cities/" + id, "GET").then((response) => {
        const data = response.data.city;
        setForm({
          name: data.name ?? "",
          province_id: data.province_id ? String(data.province_id) : "",
          status: Boolean(Number(data.status)),
        });
        setIsLoaded(true);
      });
    }
  }, [isUpdateMode, id]);

  const handleSubmit = async () => {
    if (!form.name || !form.province_id) {
      ToastrNotification.error("نام شهر و استان الزامی است");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await submitAdminResource(
        isUpdateMode ? "api/admin/cities/" + id : "api/admin/cities",
        isUpdateMode,
        { name: form.name, province_id: form.province_id, status: form.status ? 1 : 0 }
      );
      if (response.success) navigate(ROUTES.cityIndex);
      else ToastrNotification.error(response.message || "خطا در ذخیره شهر");
    } catch (error) {
      console.log("error in CityCreateEdit", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageMeta title={isUpdateMode ? "ویرایش شهر" : "ایجاد شهر"} />
      <PageBreadcrumb pageTitle={isUpdateMode ? "ویرایش شهر" : "ایجاد شهر"} />
      <ComponentCard title="اطلاعات شهر">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label>نام شهر</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>استان</Label>
            <select className={selectClassName} value={form.province_id} onChange={(e) => setForm({ ...form, province_id: e.target.value })}>
              <option value="">انتخاب استان</option>
              {provinces.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          {isLoaded && (
            <div>
              <Label>وضعیت فعال</Label>
              <div className="mt-2">
                <Switch
                  key={`status-${form.status}`}
                  label="شهر فعال است"
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
