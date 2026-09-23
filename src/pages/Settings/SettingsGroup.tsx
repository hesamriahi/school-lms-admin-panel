import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Switch from '../../components/form/switch/Switch';
import Button from '../../components/ui/button/Button';
import ApiRequest, { ApiResponse } from '../../classes/ApiRequest';
import ToastrNotification from '../../classes/ToastrNotification';
import Settings from '../../classes/Settings';
import { ROUTES } from '../../routes';
import { useNavigate } from 'react-router-dom';
import {useDispatch} from "react-redux";
import { Permission } from "../../classes/Permission.ts";
import { Navigate } from "react-router-dom";

interface SettingItem {
  id: number;
  group: string;
  label: string;
  name: string;
  type: 'float' | 'integer' | 'string' | 'boolean';
  value: string;
  options: unknown;
  created_at: string;
  updated_at: string;
}

interface SettingsApiResponse extends ApiResponse {
  data: { settings: SettingItem[] };
}

function parseValue(type: string, value: string): string | number | boolean {
  if (value === '' || value == null) {
    if (type === 'boolean') return false;
    return '';
  }
  switch (type) {
    case 'integer':
      return parseInt(value, 10) || 0;
    case 'float':
      return parseFloat(value) || 0;
    case 'boolean':
      return value === '1' || value === 'true' || String(value).toLowerCase() === 'true';
    default:
      return value;
  }
}

function formatValueForSubmit(type: string, value: string | number | boolean): string | number | boolean {
  if (type === 'boolean') return !!value;
  return value;
}

export default function SettingsGroup() {
  if (Permission.check(['super_admin']) === false) return <Navigate to={ROUTES.home} replace />;
  const { group } = useParams<{ group: string }>();
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [values, setValues] = useState<Record<string, string | number | boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (!group) return;
    setIsLoading(true);
    ApiRequest.call(`api/admin/settings/${group}`, 'GET')
      .then((response) => {
        const res = response as SettingsApiResponse;
        const list = res.data?.settings ?? [];
        setSettings(list);
        const initial: Record<string, string | number | boolean> = {};
        list.forEach((s) => {
          initial[s.name] = parseValue(s.type, s.value);
        });
        setValues(initial);
      })
      .catch(() => ToastrNotification.error('خطا در بارگذاری تنظیمات'))
      .finally(() => setIsLoading(false));
  }, [group]);

  const handleChange = (name: string, _type: string, newValue: string | number | boolean) => {
    setValues((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async () => {
    if (!group) return;
    setIsSubmitting(true);
    try {
      const body: Record<string, string | number | boolean> = {};
      settings.forEach((s) => {
        body[s.name] = formatValueForSubmit(s.type, values[s.name] ?? s.value);
      });
      const response: ApiResponse = await ApiRequest.call(
        `api/admin/settings/${group}`,
        'PUT',
        body,
        null,
        true
      );
      if (response.success) {
        Settings.callHomeApi(dispatch);
        navigate(ROUTES.home);
      }
    } catch {
      ToastrNotification.error('خطا در ذخیره تنظیمات');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!group) return null;

  let groupTitle;

  switch (group) {
    case 'loans':  groupTitle = 'وام'; break;
    case 'general': groupTitle = 'تنظیمات اصلی'; break;
    case 'insurance': groupTitle = 'بیمه'; break;
    case 'userLoan': groupTitle = 'درخواست وام توسط کاربر'; break; 

    default: groupTitle = group;
  }

  return (
    <div>
      <PageMeta title={'تنظیمات|' + groupTitle} />
      <PageBreadcrumb pageTitle={groupTitle} />
      <ComponentCard title={groupTitle}>
        {isLoading ? (
          <p className="text-gray-500 dark:text-gray-400">در حال بارگذاری...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {settings.map((setting) => (
                <div key={setting.id}>
                  <Label htmlFor={setting.name}>{setting.label}</Label>
                  {setting.type === 'boolean' ? (
                    <div className="mt-2">
                      <Switch
                        key={`${setting.id}-${values[setting.name]}`}
                        label=""
                        defaultChecked={!!values[setting.name]}
                        onChange={(checked) => handleChange(setting.name, setting.type, checked)}
                      />
                    </div>
                  ) : (
                    <Input
                      id={setting.name}
                      name={setting.name}
                      type={setting.type === 'float' || setting.type === 'integer' ? 'number' : 'text'}
                      step={setting.type === 'float' ? 0.01 : undefined}
                      value={(() => {
                        const v = values[setting.name];
                        return v === undefined || v === null || typeof v === 'boolean' ? '' : v;
                      })()}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (setting.type === 'integer') {
                          handleChange(setting.name, setting.type, v === '' ? '' : parseInt(v, 10) || 0);
                        } else if (setting.type === 'float') {
                          handleChange(setting.name, setting.type, v === '' ? '' : parseFloat(v) || 0);
                        } else {
                          handleChange(setting.name, setting.type, v);
                        }
                      }}
                      numberFormat={setting.type === 'integer' ? true : false}
                    />
                  )}
                </div>
              ))}
            </div>
            {settings.length > 0 && (
              <div className="mt-6 flex justify-end">
                <Button
                  variant="success"
                  size="md"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  type="button"
                >
                  {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
                </Button>
              </div>
            )}
          </>
        )}
      </ComponentCard>
    </div>
  );
}
