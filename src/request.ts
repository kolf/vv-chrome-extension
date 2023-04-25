import q from "query-string";

type IMethod = "GET" | "POST";

const baseRequest = async <P extends Object, T extends any>(
  url: string,
  method: IMethod,
  data: P
): Promise<T> => {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  };
  if (method === "POST") {
    options.body = JSON.stringify(data);
  }

  try {
    const res = await fetch(
      url + `${method === "GET" && data ? "?" + q.stringify(data) : ""}`,
      options
    ).then((res) => res.json());
    if (res.code !== 10000) {
      throw new Error(res.msg);
    }
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

// TODO: 类型待优化
const get = (url: string, data: { params: any }) => {
  return baseRequest(url, "GET", data.params);
};

// TODO: 类型待优化
const post = (url: string, data: any) => {
  return baseRequest(url, "POST", data);
};

export default { get, post };
