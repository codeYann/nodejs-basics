export function extractQueryParams(query: string): Record<string, any> {
  return query
    .substring(1)
    .split("&")
    .reduce((queryParams, param) => {
      const [key, value] = param.split("=");

      if (key) {
        queryParams[key] = value;
      }

      return queryParams;
    }, {} as Record<string, any>);
}
