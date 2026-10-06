import { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import FileInput from "../../components/form/input/FileInput";
import Switch from "../../components/form/switch/Switch";
import Button from "../../components/ui/button/Button";
import ApiRequest from "../../classes/ApiRequest";
import ToastrNotification from "../../classes/ToastrNotification";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../../routes";
import { Permission } from "../../classes/Permission.ts";
import { MediaDisplay, mediaUrl, selectClassName, submitAdminResource } from "../../utils/adminForm";

const DATA_KEYS = ["key", "merchantId", "terminalId", "username", "password", "mode"];

function parseGatewayData(raw: any): Record<string, string> {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw;
}

export default function GatewayCreateEdit() {
  if (Permission.check(["super_admin"]) === false) return <Navigate to={ROUTES.home} replace />;

  const { id } = useParams();
  const isUpdateMode = Boolean(id);
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(!isUpdateMode);
  const [drivers, setDrivers] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    label: "",
    is_active: true,
    image: null as MediaDisplay | null,
    data: {} as Record<string, string>,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    ApiRequest.call("api/admin/gateways/create", "GET").then((response) => {
      setDrivers(response.data.defaultDriversNames ?? []);
    });
    if (isUpdateMode) {
      ApiRequest.call("api/admin/gateways/" + id, "GET").then((response) => {
        const data = response.data.gateway;
        setForm({
          name: data.name ?? "",
          label: data.label ?? "",
          is_active: Boolean(Number(data.is_active)),
          image: data.image ?? null,
          data: parseGatewayData(data.data),
        });
        setIsLoaded(true);
      });
    }
  }, [isUpdateMode, id]);

  const handleSubmit = async () => {
    if (!form.name || !form.label) {
      ToastrNotification.error("درایور و عنوان الزامی است");
      return;
    }
    if (!isUpdateMode && !imageFile) {
      ToastrNotification.error("تصویر درگاه الزامی است");
      return;
    }
    setIsSubmitting(true);
    try {
      const hasFiles = Boolean(imageFile);
      const payload: Record<string, any> = {
        name: form.name,
        label: form.label,
        is_active: form.is_active ? 1 : 0,
        data: JSON.stringify(form.data),
      };
      if (imageFile) payload.image = imageFile;
      const response = await submitAdminResource(
        isUpdateMode ? "api/admin/gateways/" + id : "api/admin/gateways",
        isUpdateMode,
        payload,
        hasFiles
      );
      if (response.success) navigate(ROUTES.gatewayIndex);
      else ToastrNotification.error(response.message || "خطا در ذخیره درگاه");
    } catch (error) {
      console.log("error in GatewayCreateEdit", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentImageUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : mediaUrl(form.image)),
    [imageFile, form.image]
  );

  return (
    <div>
      <PageMeta title={isUpdateMode ? "ویرایش درگاه" : "ایجاد درگاه"} />
      <PageBreadcrumb pageTitle={isUpdateMode ? "ویرایش درگاه" : "ایجاد درگاه"} />
      <ComponentCard title="اطلاعات درگاه پرداخت">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label>درایور</Label>
            <select className={selectClassName} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}>
              <option value="">انتخاب کنید</option>
              {drivers.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>عنوان نمایشی</Label>
            <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          </div>
          {DATA_KEYS.map((key) => (
            <div key={key}>
              <Label>{key}</Label>
              <Input
                type={key === "password" ? "password" : "text"}
                value={form.data[key] ?? ""}
                onChange={(e) => setForm({ ...form, data: { ...form.data, [key]: e.target.value } })}
              />
            </div>
          ))}
          <div>
            <Label>{isUpdateMode ? "تصویر (اختیاری)" : "تصویر"}</Label>
            {currentImageUrl && <img src={currentImageUrl} alt="" className="mb-3 h-20 w-20 rounded-lg object-cover" />}
            <FileInput accept="image/jpeg,image/png,image/jpg,image/webp" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
          </div>
          {isLoaded && (
            <div>
              <Label>وضعیت فعال</Label>
              <div className="mt-2">
                <Switch
                  key={`is_active-${form.is_active}`}
                  label="درگاه فعال است"
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
