import React, { useState, useCallback, useEffect } from 'react';
import { useProfile } from '../providers/ProfileProvider';
import { 
  Button, 
  Card, 
  Form, 
  Input, 
  Upload, 
  message, 
  Tabs, 
  Avatar, 
  Space, 
  Typography, 
  Divider, 
  List, 
  Tag, 
  Spin,
  Skeleton,
  Row,
  Col,
  Select,
  Checkbox,
  Alert
} from 'antd';
import { 
  UserOutlined, 
  UploadOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  LinkOutlined,
  LoadingOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { RcFile } from 'antd/es/upload';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

const ProfilePage: React.FC = () => {
  const { 
    profile, 
    isLoading, 
    updateProfile, 
    updateProfilePicture, 
    updateCoverPhoto, 
    addSocialMediaLink, 
    removeSocialMediaLink,
    error
  } = useProfile();
  
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const [socialLinks, setSocialLinks] = useState<[string, string][]>([]);
  const [newSocialPlatform, setNewSocialPlatform] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [activeTab, setActiveTab] = useState('1');

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        name: profile.name,
        email: profile.email,
        bio: profile.bio || '',
        interests: profile.interests?.join(', ') || '',
        settings: {
          ...profile.settings,
          theme: profile.settings?.theme || 'light',
          language: profile.settings?.language || 'en',
          privacy: profile.settings?.privacy || 'public',
          profileVisibility: profile.settings?.profileVisibility || 'public',
          notifications: profile.settings?.notifications ?? true,
          emailNotifications: profile.settings?.emailNotifications ?? true,
        }
      });
      setSocialLinks(profile.socialLinks || []);
    }
  }, [profile, form]);

  const handleSubmit = async (values: any) => {
    try {
      const updates = {
        name: values.name,
        email: values.email,
        bio: values.bio || undefined,
        interests: values.interests 
          ? values.interests.split(',').map((i: string) => i.trim()).filter(Boolean) 
          : [],
        settings: {
          theme: values.settings?.theme || 'light',
          language: values.settings?.language || 'en',
          privacy: values.settings?.privacy || 'public',
          profileVisibility: values.settings?.profileVisibility || 'public',
          notifications: values.settings?.notifications ?? true,
          emailNotifications: values.settings?.emailNotifications ?? true,
        }
      };
      
      await updateProfile(updates);
      message.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  const handleAvatarChange = async (file: RcFile) => {
    try {
      setAvatarLoading(true);
      await updateProfilePicture(file);
      message.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error updating avatar:', error);
      message.error('Failed to update profile picture');
    } finally {
      setAvatarLoading(false);
    }
    return false;
 };

  const handleCoverChange = async (file: RcFile) => {
    try {
      setCoverLoading(true);
      await updateCoverPhoto(file);
      message.success('Cover photo updated successfully');
    } catch (error) {
      console.error('Error updating cover photo:', error);
      message.error('Failed to update cover photo');
    } finally {
      setCoverLoading(false);
    }
    return false;
  };

  const handleAddSocialLink = async () => {
    if (!newSocialPlatform || !newSocialUrl) {
      message.warning('Please fill in both platform and URL');
      return;
    }

    try {
      const success = await addSocialMediaLink(newSocialPlatform, newSocialUrl);
      if (success) {
        setSocialLinks([...socialLinks, [newSocialPlatform, newSocialUrl]]);
        setNewSocialPlatform('');
        setNewSocialUrl('');
        message.success('Social link added successfully');
      }
    } catch (error) {
      console.error('Error adding social link:', error);
      message.error('Failed to add social link');
    }
  };

  const handleRemoveSocialLink = async (platform: string) => {
    try {
      const success = await removeSocialMediaLink(platform);
      if (success) {
        setSocialLinks(socialLinks.filter(([p]) => p !== platform));
        message.success('Social link removed successfully');
      }
    } catch (error) {
      console.error('Error removing social link:', error);
      message.error('Failed to remove social link');
    }
  };

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }
    return isImage && isLt5M;
  };

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="max-w-4xl mx-auto mt-8">
        <div className="text-center py-8">
          <Title level={3}>No profile found</Title>
          <p className="text-gray-500 mt-2">We couldn't find your profile. Please try again later.</p>
          <Button 
            type="primary" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="profile-page max-w-6xl mx-auto px-4 py-8">
      {/* Cover Photo */}
      <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden mb-20 shadow-md">
        {profile.coverUrl ? (
          <img 
            src={profile.coverUrl} 
            alt="Cover" 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '/default-cover.jpg';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <Text className="text-white text-xl">Add a cover photo</Text>
          </div>
        )}
        
        <Upload
          name="cover"
          showUploadList={false}
          beforeUpload={beforeUpload}
          onChange={({ file }) => handleCoverChange(file as RcFile)}
          disabled={coverLoading}
          className="absolute top-4 right-4"
        >
          <Button 
            type="default"
            icon={coverLoading ? <LoadingOutlined /> : <UploadOutlined />} 
            loading={coverLoading}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 shadow-md"
          >
            {coverLoading ? 'Uploading...' : 'Change Cover'}
          </Button>
        </Upload>

        {/* Profile Picture */}
        <div className="absolute -bottom-16 left-8">
          <div className="relative group">
            <Avatar 
              size={132}
              src={profile.avatarUrl} 
              icon={<UserOutlined />}
              className="border-4 border-white shadow-lg transition-all duration-300 group-hover:opacity-90"
            />
            <Upload
              name="avatar"
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={({ file }) => handleAvatarChange(file as RcFile)}
              disabled={avatarLoading}
              className="absolute bottom-0 right-0"
            >
              <Button 
                type="primary"
                shape="circle"
                icon={avatarLoading ? <LoadingOutlined /> : <EditOutlined />}
                loading={avatarLoading}
                className="shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
              />
            </Upload>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Row gutter={[16, 16]} align="middle" className="mb-6">
          <Col flex="auto">
            <div className="flex items-center space-x-4">
              <div>
                <Title level={2} className="mb-1">{profile.name}</Title>
                <Text type="secondary" className="text-lg">{profile.email}</Text>
                {profile.bio && (
                  <div className="mt-2">
                    <Text className="text-gray-700">{profile.bio}</Text>
                  </div>
                )}
              </div>
            </div>
          </Col>
          <Col>
            <Button 
              type={editing ? 'default' : 'primary'} 
              icon={editing ? <CloseOutlined /> : <EditOutlined />}
              onClick={() => setEditing(!editing)}
              className="flex items-center"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </Col>
        </Row>

        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          className="profile-tabs"
          tabBarStyle={{ marginBottom: 24 }}
        >
          <TabPane tab="About" key="1">
            <Card className="shadow-sm">
              {editing ? (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                >
                  <Row gutter={24}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="name"
                        label="Full Name"
                        rules={[{ required: true, message: 'Please input your name!' }]}
                      >
                        <Input size="large" />
                      </Form.Item>

                      <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                          { required: true, message: 'Please input your email!' },
                          { type: 'email', message: 'Please enter a valid email!' },
                        ]}
                      >
                        <Input type="email" size="large" />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={12}>
                      <Form.Item
                        name={['settings', 'theme']}
                        label="Theme"
                      >
                        <Select size="large">
                          <Option value="light">Light</Option>
                          <Option value="dark">Dark</Option>
                          <Option value="system">System Default</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        name={['settings', 'language']}
                        label="Language"
                      >
                        <Select size="large">
                          <Option value="en">English</Option>
                          <Option value="es">Español</Option>
                          <Option value="fr">Français</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    
                    <Col span={24}>
                      <Form.Item
                        name="bio"
                        label="Bio"
                      >
                        <TextArea rows={4} placeholder="Tell us about yourself..." />
                      </Form.Item>

                      <Form.Item
                        name="interests"
                        label="Interests (comma-separated)"
                      >
                        <Input placeholder="e.g., React, Blockchain, Photography" />
                      </Form.Item>
                      
                      <Form.Item
                        name={['settings', 'privacy']}
                        label="Privacy Settings"
                      >
                        <Select>
                          <Option value="public">Public</Option>
                          <Option value="private">Private</Option>
                          <Option value="friends">Friends Only</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        name={['settings', 'notifications']}
                        valuePropName="checked"
                      >
                        <Checkbox>Enable Notifications</Checkbox>
                      </Form.Item>
                      
                      <Form.Item
                        name={['settings', 'emailNotifications']}
                        valuePropName="checked"
                      >
                        <Checkbox>Email Notifications</Checkbox>
                      </Form.Item>
                      
                      <Form.Item className="mt-6">
                        <Space>
                          <Button 
                            type="primary" 
                            htmlType="submit" 
                            icon={<SaveOutlined />}
                            loading={isLoading}
                          >
                            Save Changes
                          </Button>
                          <Button onClick={() => setEditing(false)}>
                            Cancel
                          </Button>
                        </Space>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              ) : (
                <div className="space-y-8">
                  <div>
                    <Title level={5} className="mb-3 text-gray-700">About Me</Title>
                    <Text className="text-gray-800">
                      {profile.bio || 'No bio provided. Add a bio to tell others about yourself.'}
                    </Text>
                  </div>

                  {(profile.interests?.length ?? 0) > 0 && (
                    <div>
                      <Title level={5} className="mb-3 text-gray-700">Interests</Title>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests?.map((interest, index) => (
                          <Tag 
                            key={index}
                            color="blue"
                            className="text-sm py-1 px-3 rounded-full"
                          >
                            {interest}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <Title level={5} className="mb-3 text-gray-700">Contact Information</Title>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="text-gray-500 w-24">Email:</span>
                          <span className="text-gray-800">{profile.email}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Title level={5} className="mb-3 text-gray-700">Account Settings</Title>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="text-gray-500 w-24">Theme:</span>
                          <span className="text-gray-800 capitalize">
                            {profile.settings?.theme || 'System'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-500 w-24">Language:</span>
                          <span className="text-gray-800">
                            {profile.settings?.language === 'en' ? 'English' : 
                             profile.settings?.language === 'es' ? 'Español' : 
                             profile.settings?.language || 'English'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-500 w-24">Privacy:</span>
                          <span className="text-gray-800 capitalize">
                            {profile.settings?.privacy || 'Public'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </TabPane>

          <TabPane tab="Social Links" key="2">
            <Card className="shadow-sm">
              <div className="mb-6">
                <Title level={5} className="mb-4 text-gray-700">Social Media Links</Title>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="flex-1">
                      <Input 
                        placeholder="Platform (e.g., Twitter, GitHub)" 
                        value={newSocialPlatform}
                        onChange={(e) => setNewSocialPlatform(e.target.value)}
                        size="large"
                      />
                    </div>
                    <div className="flex-1">
                      <Input 
                        placeholder="URL (e.g., https://twitter.com/username)" 
                        value={newSocialUrl}
                        onChange={(e) => setNewSocialUrl(e.target.value)}
                        size="large"
                      />
                    </div>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={handleAddSocialLink}
                      size="large"
                      className="whitespace-nowrap"
                    >
                      Add Link
                    </Button>
                  </div>
                  <Text type="secondary" className="text-sm">
                    Add links to your social media profiles to help others connect with you.
                  </Text>
                </div>

                {socialLinks.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={socialLinks}
                    renderItem={([platform, url]) => (
                      <List.Item
                        actions={[
                          <Button 
                            key="remove"
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                            onClick={() => handleRemoveSocialLink(platform)}
                            title="Remove link"
                          />
                        ]}
                        className="hover:bg-gray-50 rounded p-2"
                      >
                        <List.Item.Meta
                          avatar={
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50">
                              <LinkOutlined className="text-blue-500 text-lg" />
                            </div>
                          }
                          title={
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {platform}
                            </a>
                          }
                          description={
                            <Text ellipsis className="max-w-xs block">
                              {url}
                            </Text>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                      <LinkOutlined className="text-4xl" />
                    </div>
                    <Text type="secondary">No social links added yet</Text>
                    <div className="mt-2">
                      <Text type="secondary" className="text-sm">
                        Add your first social media link using the form above
                      </Text>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabPane>

          <TabPane tab="Experience & Skills" key="3">
            <Card className="shadow-sm">
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <Title level={4} className="text-gray-700 mb-2">Experience & Skills</Title>
                <Text type="secondary" className="max-w-md mx-auto block">
                  This section is coming soon. You'll be able to add your work experience, education, and skills here.
                </Text>
                <Button type="primary" className="mt-4">Get Notified</Button>
              </div>
            </Card>
          </TabPane>
          
          <TabPane tab="Activity" key="4">
            <Card className="shadow-sm">
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <Title level={4} className="text-gray-700 mb-2">Your Activity</Title>
                <Text type="secondary" className="max-w-md mx-auto block">
                  Track your recent activity, achievements, and statistics here.
                </Text>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </div>
      
      {/* Error message display */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-md">
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => {}}
          />
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
