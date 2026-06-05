'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Col,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Steps,
} from 'antd';
import {
  BankOutlined,
  CheckCircleTwoTone,
  LockOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { RegisterPayload, SubscriptionPlanShape } from '@/lib/types';
import { useRegister } from '@/hooks/useAuth';
import { logEvent } from '@/lib/audit';

// School size → which plan tier we recommend.
const SIZE_BANDS: { value: string; label: string; suggest: string }[] = [
  { value: 'lt50', label: 'Under 50 students', suggest: 'starter' },
  { value: '50_500', label: '50 – 500 students', suggest: 'growth' },
  { value: '500_2500', label: '500 – 2,500 students', suggest: 'scale' },
  { value: 'gt2500', label: '2,500+ students', suggest: 'enterprise' },
];

const ROLES: { value: string; label: string }[] = [
  { value: 'principal', label: 'Principal / Head' },
  { value: 'owner', label: 'School owner / director' },
  { value: 'admin', label: 'Office / admin staff' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'other', label: 'Other' },
];

interface StepOne {
  schoolName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
interface StepTwo {
  sizeBand: string;
  role: string;
  country: string;
}

const formatPrice = (rupees?: number) =>
  rupees == null
    ? '—'
    : rupees === 0
      ? 'Free'
      : `₹${rupees.toLocaleString('en-IN')}/mo`;

/**
 * Pick a sensible default plan from the catalogue based on the user's
 * declared school size. Falls back to the cheapest non-zero plan.
 */
function suggestPlanId(plans: SubscriptionPlanShape[], suggest: string): string {
  const active = plans.filter((p) => p.id && (p.isActive ?? true));
  if (!active.length) return '';
  // Match by name keyword (starter / growth / scale / enterprise).
  const byKeyword = active.find((p) => p.name.toLowerCase().includes(suggest));
  if (byKeyword) return byKeyword.id;
  // Otherwise prefer Growth, then the cheapest active plan.
  const growth = active.find((p) => p.name.toLowerCase().includes('growth'));
  if (growth) return growth.id;
  return [...active].sort(
    (a, b) => (a.priceMonthly ?? 0) - (b.priceMonthly ?? 0),
  )[0]?.id ?? active[0].id;
}

export function RegisterWizard({ plans }: { plans: SubscriptionPlanShape[] }) {
  const register = useRegister();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [stepOne, setStepOne] = useState<StepOne | null>(null);
  const [stepTwo, setStepTwo] = useState<StepTwo | null>(null);
  const [planId, setPlanId] = useState<string>('');

  const [formOne] = Form.useForm<StepOne>();
  const [formTwo] = Form.useForm<StepTwo>();

  const realPlans = useMemo(() => plans.filter((p) => p.id), [plans]);
  const noRealPlans = realPlans.length === 0;

  const onStepOne = (values: StepOne) => {
    setStepOne(values);
    setStep(1);
    logEvent({ event: 'register_step_completed', metadata: { step: 1 } });
  };

  const onStepTwo = (values: StepTwo) => {
    setStepTwo(values);
    const band = SIZE_BANDS.find((b) => b.value === values.sizeBand);
    const id = suggestPlanId(realPlans, band?.suggest ?? 'growth');
    setPlanId(id);
    setStep(2);
    logEvent({ event: 'register_step_completed', metadata: { step: 2 } });
  };

  const onSubmitFinal = async () => {
    if (!stepOne || !stepTwo) return;
    if (!planId) return;
    const payload: RegisterPayload = {
      schoolName: stepOne.schoolName,
      firstName: stepOne.firstName,
      lastName: stepOne.lastName,
      email: stepOne.email,
      password: stepOne.password,
      planId,
    };
    try {
      await register.mutateAsync(payload);
      logEvent({
        event: 'register_completed',
        metadata: {
          sizeBand: stepTwo.sizeBand,
          role: stepTwo.role,
          country: stepTwo.country,
        },
      });
    } catch {
      /* hook surfaces a toast; stay on step 3 so user can retry */
    }
  };

  return (
    <div>
      <h2 className="text-[26px] font-extrabold text-slate-900 mb-2">
        Create your account
      </h2>
      <p className="text-slate-500 text-[14px] mb-8">
        Already have an account?{' '}
        <Link href="/login" className="font-medium" style={{ color: 'var(--color-brand)' }}>
          Sign in
        </Link>
      </p>

      <Steps
        current={step}
        size="small"
        className="mb-8"
        items={[
          { title: 'Account' },
          { title: 'About your school' },
          { title: 'Pick a plan' },
        ]}
      />

      {noRealPlans && (
        <Alert
          type="warning"
          showIcon
          className="mb-6"
          message="No live plans found"
          description="The plans catalogue is unreachable right now. You can fill in your details — we'll let you finish once the catalogue is back."
        />
      )}

      {step === 0 && (
        <Form
          form={formOne}
          layout="vertical"
          requiredMark={false}
          onFinish={onStepOne}
          size="large"
          initialValues={stepOne ?? undefined}
        >
          <Form.Item
            name="schoolName"
            label="School name"
            rules={[{ required: true, message: 'School name is required' }]}
          >
            <Input prefix={<BankOutlined />} placeholder="Greenwood High" />
          </Form.Item>
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="firstName"
                label="First name"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Jane" autoComplete="given-name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="lastName"
                label="Last name"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="Doe" autoComplete="family-name" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="email"
            label="Work email"
            rules={[
              { required: true, message: 'Required' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="jane@school.com" autoComplete="email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            tooltip="At least 8 characters."
            rules={[
              { required: true, message: 'Required' },
              { min: 8, message: 'At least 8 characters' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Continue
          </Button>
          <p className="text-[12px] text-slate-400 text-center mt-4">
            By continuing you agree to our{' '}
            <Link href="/legal/terms" className="underline">Terms</Link> and{' '}
            <Link href="/legal/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </Form>
      )}

      {step === 1 && (
        <Form
          form={formTwo}
          layout="vertical"
          requiredMark={false}
          onFinish={onStepTwo}
          size="large"
          initialValues={
            stepTwo ?? { sizeBand: '50_500', role: 'principal', country: 'India' }
          }
        >
          <Form.Item
            name="sizeBand"
            label="How big is your school?"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Radio.Group className="flex flex-col gap-2 w-full">
              {SIZE_BANDS.map((b) => (
                <Radio key={b.value} value={b.value} className="!w-full">
                  {b.label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="role"
            label="Your role"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Select options={ROLES} />
          </Form.Item>
          <Form.Item name="country" label="Country">
            <Input placeholder="India" />
          </Form.Item>
          <div className="flex gap-2">
            <Button onClick={() => setStep(0)} block>
              Back
            </Button>
            <Button type="primary" htmlType="submit" block>
              Continue
            </Button>
          </div>
        </Form>
      )}

      {step === 2 && (
        <div>
          <div className="text-[14px] text-slate-500 mb-4">
            Based on your school size we&apos;ve highlighted a plan. Every paid plan
            starts with a 14-day trial. Switch any time from your dashboard.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(realPlans.length ? realPlans : plans).map((p) => {
              const selected = p.id && planId === p.id;
              const disabled = !p.id;
              return (
                <button
                  type="button"
                  key={p.name + p.id}
                  onClick={() => p.id && setPlanId(p.id)}
                  disabled={disabled}
                  className={`text-left rounded-[14px] border-2 p-5 transition-colors ${
                    selected
                      ? 'border-[var(--color-brand)] bg-[var(--color-brand-50)]'
                      : disabled
                        ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                        : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-extrabold text-slate-900">{p.name}</div>
                      <div className="text-slate-500 text-[12px] mt-0.5">
                        {p.description ?? ''}
                      </div>
                    </div>
                    {selected && (
                      <CheckCircleTwoTone twoToneColor="#4f46e5" style={{ fontSize: 20 }} />
                    )}
                  </div>
                  <div className="text-[20px] font-extrabold mt-4 text-slate-900">
                    {formatPrice(p.priceMonthly)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {p.maxStudents ? `Up to ${p.maxStudents.toLocaleString('en-IN')} students` : 'Unlimited students'}
                    {p.maxStaff ? ` · up to ${p.maxStaff.toLocaleString('en-IN')} staff` : ''}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 mt-8">
            <Button onClick={() => setStep(1)} block>
              Back
            </Button>
            <Button
              type="primary"
              htmlType="button"
              onClick={onSubmitFinal}
              loading={register.isPending}
              disabled={!planId || noRealPlans}
              block
            >
              Start my 14-day trial
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
