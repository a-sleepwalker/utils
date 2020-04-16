import React from 'react';
import {Route, Switch} from 'react-router-dom';

interface RouteConfig {
  key?: React.Key;
  path: string;
  name?: string;
  redirect?: string | 'noredirect'; // for breadcrumbs
  meta?: StringMap;
  strict?: boolean;
  exact?: boolean;
  component: React.ComponentType<any>;
  children?: RouteConfig[];
}

interface StringMap {
  [k: string]: string
}

function renderRoutes(routeConfigs: RouteConfig[]) {
  let err404 = {} as RouteConfig;
  const filterRoutes = routeConfigs.filter((route) => {
    if (route.path === '*') {
      err404 = route;
      return false;
    }
    return true;
  });
  return (function render404Routes(routesWithout404: RouteConfig[], extraProps: any = {}, switchProps = {}) {
    return routesWithout404 ? (
      <Switch {...switchProps}>
        {routesWithout404.map((route, i) => {
          const isAbsolutePath = route.path.startsWith('/');
          return (
            <Route
              key={route.key || i}
              path={isAbsolutePath ? route.path : `${extraProps.parentPath}/${route.path}`}
              exact={route.exact}
              strict={route.strict}
              render={(props) => {
                const childRoutes = route.children
                  ? render404Routes(
                    route.children,
                    {parentPath: route.path},
                    {location: props?.location},
                  )
                  : null;
                if (route.component) {
                  return (
                    <route.component {...props} route={route} {...extraProps}>
                      {childRoutes}
                    </route.component>
                  );
                }
                return childRoutes;
              }}
            />
          );
        })}
        {err404?.component && <Route path="*" component={err404.component}/>}
      </Switch>
    ) : null;
  }(filterRoutes));
}

export default renderRoutes;
