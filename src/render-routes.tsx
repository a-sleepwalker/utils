import {Redirect, Route, Switch} from 'react-router-dom';
import React from 'react';

interface RouteConfig {
  key?: React.Key;
  path: string;
  name?: string;
  redirect?: string | 'noredirect'; // for breadcrumbs
  meta?: StringMap;
  strict?: boolean;
  exact?: boolean;
  component?: React.ComponentType<any>;
  children?: RouteConfig[];
}

interface StringMap {
  [key: string]: string;
}

export default function renderRoutes(routeConfigs: RouteConfig[]) {
  if (!routeConfigs || !routeConfigs.length) return null;
  const global404 = routeConfigs.find((route) => route.path === '*');
  return (function __(routes, extraProps: any = {}, switchProps = {}) {
    const sortedRoutes = routes.sort((next, cur) => {
      let n = 1;
      let c = 1;
      if (next.path === '*') n = 100;
      if (cur.path === '*') c = 100;
      if (next.redirect) n = 10;
      if (cur.redirect) c = 10;
      return n - c;
    });
    return (
      <Switch {...switchProps}>
        {sortedRoutes.map((route, i) => {
          if (route.path === '*') return <Route key={route.key || i} path="*" component={route.component}/>;
          if (route.redirect) return <Redirect key={route.key || i} from={route.path} to={route.redirect as string}/>;
          const isAbsolutePath = route.path.startsWith('/');
          return (
            <Route
              key={route.key || i}
              path={isAbsolutePath ? route.path : `${extraProps.parentPath}/${route.path}`}
              exact={route.exact}
              strict={route.strict}
              render={(props) => {
                const childRoutes = route.children
                  ? __(
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
        {global404?.component && <Route path="*" component={global404.component}/>}
      </Switch>
    );
  })(routeConfigs);
}
