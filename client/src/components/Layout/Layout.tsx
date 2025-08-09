// src/components/Layout.tsx
import React, { useState } from 'react';
import { FileTextOutlined, FormOutlined } from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import styles from './Layout.module.css';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';

const { Header, Content, Sider } = Layout;

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 路径匹配函数（支持子路径）
  const getKeyByPath = (path: string): string => {
    if (path.startsWith('/questions')) return '2'; // 匹配 /questions 及其所有子路径
    if (path === '/' || path.startsWith('/notes')) return '1'; // 学习心得路径
    return '1'; // 默认高亮学习心得
  };
  const selectedKey = getKeyByPath(location.pathname);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === '1') navigate('/');
    else if (key === '2') navigate('/questions');
  };

  const items = [
    { key: '1', icon: <FormOutlined />, label: '学习心得' },
    { key: '2', icon: <FileTextOutlined />, label: '题库管理' },
  ];

  return (
    <div className="h-screen flex">
      <Layout style={{ minHeight: '100vh' }} className="h-screen ">
        <Sider
          breakpoint="lg"
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          {collapsed ? (
            <div className={styles.smallLogo} />
          ) : (
            <div className={styles.largeLogo} />
          )}

          <Menu
            theme="dark"
            // defaultSelectedKeys={['1']}  把默认高亮第一个改为高亮当前路径
            selectedKeys={[selectedKey]}
            mode="inline"
            items={items}
            onClick={handleMenuClick}
          />
        </Sider>
        <Layout className={'flex-1 min-w-[370px] '} style={{ height: '100vh' }}>
          <Header
            className={styles.header}
            style={{ padding: 0, color: 'white' }}
          >
            中南民族大学 冯姿 大作业
          </Header>
          <Content
            style={{
              margin: '0 16px',
              flex: 1 /* 2. 让Content充满剩余空间 */,
              overflowY: 'auto' /* 3. 开启垂直滚动条 */,
              height: 'calc(100vh - 64px)',
            }}
          >
            <div
              style={{
                width: '100%',
                padding: 24,
                minHeight: 360,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              <Outlet /> {/* 用于渲染子页面 */}
            </div>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default AppLayout;
