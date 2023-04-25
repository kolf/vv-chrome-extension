import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Input, Form, Button, Select, Avatar, message } from "antd";
import request from "./request";

// //写cookies

// function setCookie(name, value) {
//   var Days = 30;
//   var exp = new Date();
//   exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
//   document.cookie = name + "=" + escape(value);
// }

// //读取cookies
// function getCookie(name: string) {
//   var arr,
//     reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");

//   if ((arr = document.cookie.match(reg))) return unescape(arr[2]);
//   else return null;
// }

// const Option = Select.Option
const PROXY_MAP = {
  production: "https://worktest3.vvtechnology.cn",
  pre: "https://workpre.vvtechnology.cn",
  uat: "https://uat.vvtechnology.cn",
  pub1: "https://workdev-public1.vvtechnology.cn",
  pub2: "https://workdev-public2.vvtechnology.cn",
  pub3: "https://workdev-public3.vvtechnology.cn",
  dev1: "https://workdev1.vvtechnology.cn",
  test2: "https://worktest2.vvtechnology.cn",
  test3: "https://worktest3.vvtechnology.cn",
  test4: "https://worktest4.vvtechnology.cn",
  test5: "https://worktest5.vvtechnology.cn",
  test6: "https://worktest6.vvtechnology.cn",
  test7: "https://worktest7.vvtechnology.cn",
  test8: "https://worktest8.vvtechnology.cn",
  work: "https://workdev-workmanage1.vvtechnology.cn",
  business: "https://workdev-business.vvtechnology.cn",
  business1: "https://workdev-business1.vvtechnology.cn",
  business2: "https://workdev-business2.vvtechnology.cn",
  business3: "https://workdev-business3.vvtechnology.cn",
};

const defaultUser = {
  username: "kuncheng-wang@vv.com.sg",
  password: "123456aA",
  apiRoot: PROXY_MAP.dev1,
};

const options = Object.entries(PROXY_MAP).map(([label, value]) => ({
  value,
  label,
  key: label,
}));

const clearExtensionStorage = (typeOfStorage = "local") => {
  chrome.storage.local.remove([typeOfStorage], function () {
    const error = chrome.runtime.lastError;
    if (error) {
      console.error(error);
    }
  });
};

const getActiveTabURL = async () => {
  try {
    const tabs = await chrome.tabs.query({
      currentWindow: true,
      active: true,
    });
    return tabs[0];
  } catch (err) {
    console.error(err);
  }
};

const Popup = () => {
  const [form] = Form.useForm();
  const [conformLoading, setConfirmLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const handleFinish = async (values: any) => {
    const { apiRoot, ...params } = values;
    setConfirmLoading(true);
    try {
      const res: any = await request.post(
        `${apiRoot}/api/uc/public/v2new/account/login`,
        {
          auth_type: "account",
          client_id: "1470305119391260673",
          client_secret: "f8a24f83bce48f6446f06b9095fd6c12",
          ...params,
        }
      );
      if (!res || res.code !== 10000) {
        throw new Error(res.error);
      }
      const activeTab = await getActiveTabURL();
      const tabId: any = activeTab?.id;

      // console.log(activeTab, "activeTab");
      await clearExtensionStorage();
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          func: (data) => {
            const dataStr = JSON.stringify(data);
            localStorage.setItem("SYSTEM.currentUser", dataStr);
            localStorage.setItem("currentUser", dataStr);
            sessionStorage.setItem("Authorization", dataStr);
          },
          args: [res.data],
        },
        () => {
          setCurrentUser(res.data);
        }
      );
    } catch (err: any) {
      message.error(err?.message);
    }
    setConfirmLoading(false);
  };

  const handleLogout = async () => {
    const activeTab = await getActiveTabURL();
    const tabId: any = activeTab?.id;
    await clearExtensionStorage();
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        func: () => {
          localStorage.removeItem("SYSTEM.currentUser");
          localStorage.removeItem("currentUser");
          sessionStorage.removeItem("Authorization");
        },
      },
      (res) => {
        setCurrentUser(null);
      }
    );
  };

  useEffect(() => {
    const run = async () => {
      const activeTab = await getActiveTabURL();
      const tabId: any = activeTab?.id;
      await clearExtensionStorage();
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          func: () => {
            const res = JSON.parse(localStorage.getItem("currentUser") || "{}");
            return res;
          },
        },
        (res) => {
          try {
            const user = res[0].result;
            if (!user.name) {
              throw new Error(`用户未登陆！`);
            }
            setCurrentUser(user);
          } catch (error) {}
        }
      );
    };

    run();
  }, []);

  return (
    <div className="root">
      {currentUser ? (
        <div>
          <div className="text-center" style={{ padding: "48px 0 24px" }}>
            <Avatar
              size={80}
              src={<img src={currentUser.avatarFile[0].url} alt="avatar" />}
            />
            <p>{currentUser.name}</p>
          </div>
          <div>
            <Button
              type="primary"
              block
              loading={conformLoading}
              onClick={handleLogout}
            >
              退出登陆
            </Button>
          </div>
        </div>
      ) : (
        <Form
          autoComplete="off"
          layout="vertical"
          onFinish={handleFinish}
          form={form}
          style={{ width: "100%" }}
          initialValues={defaultUser}
        >
          <h4 className="logo-title">
            <img src="./logo.png" width="60" alt="微微" />
          </h4>
          <Form.Item
            name="apiRoot"
            rules={[{ required: true, message: "请选择环境" }]}
          >
            <Select placeholder="请选择环境" options={options} />
          </Form.Item>

          <Form.Item
            name="username"
            rules={[{ required: true, message: "微微号/邮箱" }]}
          >
            <Input placeholder="微微号/邮箱" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={conformLoading}
            >
              登陆
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
