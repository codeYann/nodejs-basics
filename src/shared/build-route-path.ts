export function buildRoutePath(path: string) {
  const routeParamRegex = /:([a-zA-Z]+)/g;
  const pathWithParams = path.replaceAll(routeParamRegex, "(?<$1>[a-z0-9-_]+)");
  const pathRegex = new RegExp(`^${pathWithParams}(?<query>\\?(.*))?$`);

  return pathRegex;
}
