USE [master]
GO
/****** Object:  Database [Yechidot]    Script Date: 19/02/2026 17:11:39 ******/
CREATE DATABASE [Yechidot]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'Yechidot', FILENAME = N'H:\Data\Yechidot.mdf' , SIZE = 7013440KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'Yechidot_log', FILENAME = N'I:\Yechidot_log.ldf' , SIZE = 131584KB , MAXSIZE = UNLIMITED, FILEGROWTH = 131072KB )
GO
ALTER DATABASE [Yechidot] SET COMPATIBILITY_LEVEL = 140
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [Yechidot].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [Yechidot] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [Yechidot] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [Yechidot] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [Yechidot] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [Yechidot] SET ARITHABORT OFF 
GO
ALTER DATABASE [Yechidot] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [Yechidot] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [Yechidot] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [Yechidot] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [Yechidot] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [Yechidot] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [Yechidot] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [Yechidot] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [Yechidot] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [Yechidot] SET  DISABLE_BROKER 
GO
ALTER DATABASE [Yechidot] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [Yechidot] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [Yechidot] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [Yechidot] SET ALLOW_SNAPSHOT_ISOLATION ON 
GO
ALTER DATABASE [Yechidot] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [Yechidot] SET READ_COMMITTED_SNAPSHOT ON 
GO
ALTER DATABASE [Yechidot] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [Yechidot] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [Yechidot] SET  MULTI_USER 
GO
ALTER DATABASE [Yechidot] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [Yechidot] SET DB_CHAINING OFF 
GO
ALTER DATABASE [Yechidot] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [Yechidot] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [Yechidot] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [Yechidot] SET QUERY_STORE = OFF
GO
USE [Yechidot]
GO
/****** Object:  User [LoopReadWrite]    Script Date: 19/02/2026 17:11:39 ******/
CREATE USER [LoopReadWrite] FOR LOGIN [LoopReadWrite] WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  User [BUILTIN\Users]    Script Date: 19/02/2026 17:11:39 ******/
CREATE USER [BUILTIN\Users] FOR LOGIN [BUILTIN\Users]
GO
/****** Object:  User [Backu4Sure]    Script Date: 19/02/2026 17:11:39 ******/
CREATE USER [Backu4Sure] FOR LOGIN [Backu4Sure] WITH DEFAULT_SCHEMA=[dbo]
GO
ALTER ROLE [db_datareader] ADD MEMBER [LoopReadWrite]
GO
ALTER ROLE [db_datawriter] ADD MEMBER [LoopReadWrite]
GO
ALTER ROLE [db_backupoperator] ADD MEMBER [Backu4Sure]
GO
/****** Object:  Table [dbo].[יחידות]    Script Date: 19/02/2026 17:11:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[יחידות](
	[קוד_זיהוי] [int] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[תאריך_קליטה] [datetime] NULL,
	[IDAlfon] [int] NULL,
	[מס_ילד] [int] NULL,
	[מס_יחידה] [int] NULL,
	[תאריך_הצטרפות] [datetime] NULL,
	[גיל_הצטרפות] [float] NULL,
	[נציג] [int] NULL,
	[נציג_משנה] [int] NULL,
	[חודש_לנציג] [datetime] NULL,
	[הסדר] [nvarchar](50) NULL,
	[סיווג_יחידה] [int] NULL,
	[סיווג_ראשוני] [int] NULL,
	[תאריך_שדרוג] [datetime] NULL,
	[סיווג_שדרוג] [int] NULL,
	[הושלם] [bit] NULL,
	[תאריך_הושלם] [datetime] NULL,
	[אמצעי_תשלום] [int] NULL,
	[תחילת_תרומה] [datetime] NULL,
	[תאריך_טרומי] [nvarchar](30) NULL,
	[תאריך_ייעוד] [datetime] NULL,
	[סטטוס_יחידה] [int] NULL,
	[הערות_סטטוס] [nvarchar](50) NULL,
	[תאריך_אישור] [datetime] NULL,
	[סיבת_אישור] [nvarchar](25) NULL,
	[לא_נצרך] [bit] NULL,
	[נשלח] [bit] NULL,
	[תאריך_שליחה] [datetime] NULL,
	[מס_הוק] [int] NULL,
	[אישור_הלוואה] [datetime] NULL,
	[מס_הלואה] [int] NULL,
	[הערות] [nvarchar](250) NULL,
	[לשדרג] [bit] NULL,
	[סוג הלוואה] [int] NULL,
	[ייעוד_ההלוואה] [nvarchar](30) NULL,
	[פעיל] [bit] NULL,
	[שולם] [float] NULL,
	[מס_בקשה] [int] NULL,
	[בוטל] [bit] NULL,
	[תאריך_ביטול] [datetime] NULL,
	[מס_הקדמה] [int] NULL,
 CONSTRAINT [PK_יחידות] PRIMARY KEY CLUSTERED 
(
	[קוד_זיהוי] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[View_2]    Script Date: 19/02/2026 17:11:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[View_2]
AS
SELECT        dbo.יחידות.*
FROM            dbo.יחידות
GO
/****** Object:  View [dbo].[View_1]    Script Date: 19/02/2026 17:11:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[View_1]
AS
SELECT        קוד_זיהוי, תאריך_קליטה, IDAlfon, מס_ילד, מס_יחידה, תאריך_הצטרפות, גיל_הצטרפות, נציג, נציג_משנה, חודש_לנציג, הסדר, סיווג_יחידה, סיווג_ראשוני, תאריך_שדרוג, סיווג_שדרוג, הושלם, תאריך_הושלם, אמצעי_תשלום, 
                         תחילת_תרומה, תאריך_טרומי, תאריך_ייעוד, סטטוס_יחידה, הערות_סטטוס, תאריך_אישור, סיבת_אישור, לא_נצרך, נשלח, תאריך_שליחה, מס_הוק, אישור_הלוואה, מס_הלואה, הערות, לשדרג, [סוג הלוואה], ייעוד_ההלוואה, פעיל, 
                         שולם, מס_בקשה, בוטל, תאריך_ביטול, מס_הקדמה
FROM            YechidotOLD.dbo.יחידות
GO
/****** Object:  View [dbo].[פרטי_תנועות]    Script Date: 19/02/2026 17:11:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[פרטי_תנועות]
AS
SELECT        [מס סידורי], [מס תנועה], סכום, מס_תשלום, [תאריך ערך], שער, [מס קבלה], שח, הנהח, תוספת, קוד_גביה, קוד_יומן, אסמכתא, מס_הפקדה, נתיב_שיק, [4_ספרות], פעולה, בנק, סניף, חשבון, שיק, חזר, מס_אישור, סולק, סכום_חוז, נפרע, 
                         תאריך_פרעון, הונפק, תלמיד, סך_עמלה, דולר
FROM            הגמח_המרכזי.dbo.[פרטי תנועות]
GO
/****** Object:  View [dbo].[תנועות]    Script Date: 19/02/2026 17:11:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[תנועות]
AS
SELECT        מס_תנועה, IDAlfon, סוג_מסמך, קוד_פעולה, תאריך, תאריך_עברי, תאריך_קליטה, סכום, מעמ, מטבע, שער, סכום_בשח, [אמצעי תשלום], [קוד קופה], סוכן, חשבון_חובה, חשבון_זכות, קוד_אירוע, מס_מנה, קבלה_ידני, מס_קבלה_ידני, קוד_מכתב, 
                         קמפיין, [סיווג תנועה], סגירה, מס_תשלומים, אסמכתא, [קוד מוסד], בעל_החשבון, מס_אשראי, חברה, Cvv, מסלול, [קוד עיסקה], [סוג עיסקה], [סוג אשראי], תוקף, [תשלום ראשון], [תשלום קבוע], יום_חיוב, פעיל, [תחילת חיוב], [סוף חיוב], 
                         [תאריך חיוב אחרון], [תוצאות שידור אחרון], [4_ספרות], ISO, בנק, פעולה, סניף, חשבון, תדירות, הגבלת_סכום, תא_פג_תוקף, סטטוס, הערות, סיווג_חופשי1, סיווג_חופשי2, סיווג_חופשי3, סיווג_חופשי4, סיווג_חופשי5, סיווג_חופשי6, מס_שיק, 
                         פריסה_לפי_עברי, סהכ_גביה, סהכ_גביה_שח, סך_פרטי_תנועה, אישור_אוטומטי, מספר_אישור, תאריך_אישור, הערה_לקבלה, שם_לקבלה, קישור_תנועה, הקפאה_מתאריך, הקפאה_עד_תאריך, סיבת_הקפאה, מס_תיק, מס_פקדון, מס_בקשה, יומן, 
                         מחלקה, סעיף, אישור_הקמה, קוד_תלמיד, הנהח, IDImport, קבלה, עמלה, קוד_חברה, מס_מסמך, סיווג_מלגה1, סיווג_מלגה2, סיווג_מלגה3, סיווג_מלגה4, IDOlde, קוד_טלמרק, מס_קרן, ניכוי_מס, יחידות
FROM            הגמח_המרכזי.dbo.תנועות
GO
/****** Object:  Table [dbo].[בקשות_הקדמה]    Script Date: 19/02/2026 17:11:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[בקשות_הקדמה](
	[זיהוי_בקשה] [int] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[IDAlfon] [int] NULL,
	[סוג_בקשה] [int] NULL,
	[תאריך_קליטה] [date] NULL,
	[תאריך_עברי] [nvarchar](25) NULL,
	[קוד_החלטת_הנהלה] [int] NULL,
	[שם_מאשר_הנהלה] [nvarchar](20) NULL,
	[פרטים_אישור_הנהלה] [nvarchar](250) NULL,
	[תאריך_עדכון] [date] NULL,
	[סיבת_בקשה] [nvarchar](25) NULL,
	[פרטי_הבקשה] [nvarchar](250) NULL,
	[אושר_לתאריך] [date] NULL,
	[שינוי_מסלול] [int] NULL,
	[אישור_שינוי_מסלול] [bit] NULL,
	[קוד_סטטוס] [int] NULL,
	[סך_בקשה] [float] NULL,
	[סך_יחידות] [float] NULL,
	[בוצע] [bit] NULL,
 CONSTRAINT [PK_בקשות_הקדמה] PRIMARY KEY CLUSTERED 
(
	[זיהוי_בקשה] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[יחידות_שיעבודים]    Script Date: 19/02/2026 17:11:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[יחידות_שיעבודים](
	[זיהוי] [int] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[מספר_הלואה] [int] NULL,
	[מספר_יחידה] [int] NULL,
	[הערת_שיעבוד] [nvarchar](150) NULL,
	[שעבוד_פעיל] [bit] NULL,
 CONSTRAINT [PK_יחידות_שיעבודים] PRIMARY KEY CLUSTERED 
(
	[זיהוי] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[יחידות_תיעוד]    Script Date: 19/02/2026 17:11:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[יחידות_תיעוד](
	[ID] [int] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[יחידה] [int] NOT NULL,
	[תנועה] [int] NOT NULL,
	[סך_תשלום] [float] NOT NULL,
	[תאריך] [date] NOT NULL,
	[הערת_תיעוד] [nvarchar](50) NULL,
	[NumGviya] [int] NULL,
	[סך_קודם] [float] NULL,
	[תאריך_שינוי] [date] NULL,
 CONSTRAINT [PK_יחידות_תיעוד_1] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[יחידות_תרומות]    Script Date: 19/02/2026 17:11:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[יחידות_תרומות](
	[זיהוי] [int] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[קוד_יחידה] [int] NOT NULL,
	[קוד_תרומה] [int] NOT NULL,
	[אחוז] [float] NULL,
	[הערה] [nvarchar](50) NULL,
	[סך_ניכוי] [float] NULL,
	[מתאריך] [date] NULL,
 CONSTRAINT [PK_יחידות_תרומות_1] PRIMARY KEY CLUSTERED 
(
	[קוד_יחידה] ASC,
	[קוד_תרומה] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ילדים_יחידות]    Script Date: 19/02/2026 17:11:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ילדים_יחידות](
	[קוד_ילד] [int] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[תאריך_קליטה] [datetime] NULL,
	[IDAlfon] [int] NULL,
	[קירבה] [nvarchar](20) NULL,
	[פרטי] [nvarchar](50) NULL,
	[משפחה] [nvarchar](25) NULL,
	[ת_זהות] [nvarchar](20) NULL,
	[דרכון] [nvarchar](20) NULL,
	[מין] [nvarchar](3) NULL,
	[תאריך_לידה] [datetime] NULL,
	[מגזר] [nvarchar](20) NULL,
	[הערות_ילד] [nvarchar](250) NULL,
 CONSTRAINT [PK_ילדים_יחידות] PRIMARY KEY CLUSTERED 
(
	[קוד_ילד] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[מעקב_בקשות_הקדמה]    Script Date: 19/02/2026 17:11:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[מעקב_בקשות_הקדמה](
	[קוד_זיהוי] [int] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[IDBakasha] [int] NULL,
	[תאריך_מעקב] [date] NULL,
	[תאריך_עברי] [nvarchar](50) NULL,
	[פרטים] [nvarchar](250) NULL,
	[מס_סטטוס] [int] NULL,
	[משתמש] [nvarchar](50) NULL,
	[הערה] [nvarchar](150) NULL,
	[ש_מסלול] [int] NULL,
 CONSTRAINT [PK_מעקב_בקשות_הקדמה] PRIMARY KEY CLUSTERED 
(
	[קוד_זיהוי] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ניקוד_שנות_ייעוד]    Script Date: 19/02/2026 17:11:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ניקוד_שנות_ייעוד](
	[שנה] [int] NOT NULL,
	[ניקוד] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[שנה] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[סטטוס_יחידות]    Script Date: 19/02/2026 17:11:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[סטטוס_יחידות](
	[קוד_סטטוס] [int] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[סטטוס] [nvarchar](50) NULL,
 CONSTRAINT [PK_סטטוס_יחידות] PRIMARY KEY CLUSTERED 
(
	[קוד_סטטוס] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[סיווג_יחידה]    Script Date: 19/02/2026 17:11:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[סיווג_יחידה](
	[מס_סיווג] [int] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[סיווג] [nvarchar](50) NULL,
	[תרומה_חודשית] [float] NULL,
	[חודשי_תרומה] [float] NULL,
	[סך_תרומה] [float] NULL,
	[הלוואה] [float] NULL,
	[פירעון_חודשי] [float] NULL,
	[מענק] [float] NULL,
	[מס_יחידות] [int] NULL,
	[גילאים] [nvarchar](50) NULL,
	[הערות] [nvarchar](250) NULL,
	[פעיל] [bit] NOT NULL,
	[מס_קמפיין] [int] NULL,
	[שער_מכפיל] [float] NULL,
	[ערבים] [int] NULL,
	[קופה] [int] NULL,
	[מס_מטבע] [int] NULL,
 CONSTRAINT [PK_סיווג_יחידה] PRIMARY KEY CLUSTERED 
(
	[מס_סיווג] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[קודי_סוגי_בקשות]    Script Date: 19/02/2026 17:11:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[קודי_סוגי_בקשות](
	[קוד_סוג_בקשה] [int] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[סוג_בקשה] [nvarchar](50) NULL,
	[מחדל_סטטוס] [int] NULL,
	[דוח] [nvarchar](10) NULL,
 CONSTRAINT [PK_1קודי_סוגי_בקשות] PRIMARY KEY CLUSTERED 
(
	[קוד_סוג_בקשה] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[קודי_סוגי_בקשות1]    Script Date: 19/02/2026 17:11:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[קודי_סוגי_בקשות1](
	[קוד_סוג_בקשה] [int] NOT NULL,
	[סוג_בקשה] [nvarchar](50) NULL,
	[מחדל_סטטוס] [int] NULL,
 CONSTRAINT [PK_קודי_סוגי_בקשות] PRIMARY KEY CLUSTERED 
(
	[קוד_סוג_בקשה] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[קודי_סטטוס_הקדמה]    Script Date: 19/02/2026 17:11:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[קודי_סטטוס_הקדמה](
	[קוד_סטטוס] [int] IDENTITY(0,1) NOT FOR REPLICATION NOT NULL,
	[סטטוס_בקשה] [nvarchar](50) NULL,
	[מאושר] [bit] NULL,
	[צבע] [nvarchar](30) NULL,
	[המתנה_לאישור] [int] NULL,
 CONSTRAINT [PK_קודי_סטטוס_הקדמה] PRIMARY KEY CLUSTERED 
(
	[קוד_סטטוס] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[קודי_תהליכים_הקדמה]    Script Date: 19/02/2026 17:11:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[קודי_תהליכים_הקדמה](
	[קוד_תהליך] [int] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[תהליך] [nvarchar](50) NULL,
	[ברירת_מחדל] [bit] NULL,
	[נדרש] [bit] NULL,
 CONSTRAINT [PK_קודי_תהליכים_הקדמה] PRIMARY KEY CLUSTERED 
(
	[קוד_תהליך] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[תהליכי_בקשת_הקדמה]    Script Date: 19/02/2026 17:11:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[תהליכי_בקשת_הקדמה](
	[זיהוי] [int] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[מס_בקשה] [int] NOT NULL,
	[מס_תהליך] [int] NOT NULL,
	[בוצע] [bit] NULL,
	[הערה] [nvarchar](250) NULL,
 CONSTRAINT [PK_תהליכי_בקשת_הקדמה] PRIMARY KEY CLUSTERED 
(
	[מס_בקשה] ASC,
	[מס_תהליך] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Index [IX_יחידות]    Script Date: 19/02/2026 17:11:39 ******/
CREATE NONCLUSTERED INDEX [IX_יחידות] ON [dbo].[יחידות]
(
	[מס_הלואה] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_יחידות_1]    Script Date: 19/02/2026 17:11:39 ******/
CREATE NONCLUSTERED INDEX [IX_יחידות_1] ON [dbo].[יחידות]
(
	[מס_בקשה] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_יחידות_2]    Script Date: 19/02/2026 17:11:39 ******/
CREATE NONCLUSTERED INDEX [IX_יחידות_2] ON [dbo].[יחידות]
(
	[מס_הוק] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_יחידות_3]    Script Date: 19/02/2026 17:11:39 ******/
CREATE NONCLUSTERED INDEX [IX_יחידות_3] ON [dbo].[יחידות]
(
	[תאריך_הצטרפות] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_יחידות_4]    Script Date: 19/02/2026 17:11:39 ******/
CREATE NONCLUSTERED INDEX [IX_יחידות_4] ON [dbo].[יחידות]
(
	[חודש_לנציג] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_יחידות_IDAlfon]    Script Date: 19/02/2026 17:11:39 ******/
CREATE NONCLUSTERED INDEX [IX_יחידות_IDAlfon] ON [dbo].[יחידות]
(
	[IDAlfon] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_יחידות_ילד]    Script Date: 19/02/2026 17:11:39 ******/
CREATE NONCLUSTERED INDEX [IX_יחידות_ילד] ON [dbo].[יחידות]
(
	[מס_ילד] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_יחידות_שיעבודים]    Script Date: 19/02/2026 17:11:39 ******/
CREATE NONCLUSTERED INDEX [IX_יחידות_שיעבודים] ON [dbo].[יחידות_שיעבודים]
(
	[מספר_יחידה] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_יחידות_שיעבודים_1]    Script Date: 19/02/2026 17:11:39 ******/
CREATE NONCLUSTERED INDEX [IX_יחידות_שיעבודים_1] ON [dbo].[יחידות_שיעבודים]
(
	[מספר_הלואה] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_יחידות_תיעוד]    Script Date: 19/02/2026 17:11:39 ******/
CREATE NONCLUSTERED INDEX [IX_יחידות_תיעוד] ON [dbo].[יחידות_תיעוד]
(
	[NumGviya] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [יחידה_יחידות_תיעוד]    Script Date: 19/02/2026 17:11:39 ******/
CREATE NONCLUSTERED INDEX [יחידה_יחידות_תיעוד] ON [dbo].[יחידות_תיעוד]
(
	[יחידה] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [יחידות_תיעוד_תנועה]    Script Date: 19/02/2026 17:11:39 ******/
CREATE NONCLUSTERED INDEX [יחידות_תיעוד_תנועה] ON [dbo].[יחידות_תיעוד]
(
	[תנועה] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [תאריך_יחידות_תיעוד]    Script Date: 19/02/2026 17:11:39 ******/
CREATE NONCLUSTERED INDEX [תאריך_יחידות_תיעוד] ON [dbo].[יחידות_תיעוד]
(
	[תאריך] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_יחידה]    Script Date: 19/02/2026 17:11:39 ******/
CREATE NONCLUSTERED INDEX [IX_יחידה] ON [dbo].[יחידות_תרומות]
(
	[קוד_יחידה] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_קוד_תנועה]    Script Date: 19/02/2026 17:11:39 ******/
CREATE NONCLUSTERED INDEX [IX_קוד_תנועה] ON [dbo].[יחידות_תרומות]
(
	[קוד_תרומה] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [מתאריך_יחידות_תרומות]    Script Date: 19/02/2026 17:11:39 ******/
CREATE NONCLUSTERED INDEX [מתאריך_יחידות_תרומות] ON [dbo].[יחידות_תרומות]
(
	[מתאריך] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_ילדים_יחידות]    Script Date: 19/02/2026 17:11:39 ******/
CREATE NONCLUSTERED INDEX [IX_ילדים_יחידות] ON [dbo].[ילדים_יחידות]
(
	[IDAlfon] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_ילדים_יחידות_1]    Script Date: 19/02/2026 17:11:39 ******/
CREATE NONCLUSTERED INDEX [IX_ילדים_יחידות_1] ON [dbo].[ילדים_יחידות]
(
	[ת_זהות] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [dbo].[יחידות] ADD  CONSTRAINT [DF_יחידות_הושלם]  DEFAULT ((0)) FOR [הושלם]
GO
ALTER TABLE [dbo].[יחידות] ADD  CONSTRAINT [DF_יחידות_לא_נצרך]  DEFAULT ((0)) FOR [לא_נצרך]
GO
ALTER TABLE [dbo].[יחידות] ADD  CONSTRAINT [DF_יחידות_נשלח]  DEFAULT ((0)) FOR [נשלח]
GO
ALTER TABLE [dbo].[יחידות] ADD  CONSTRAINT [DF_יחידות_לשדרג]  DEFAULT ((0)) FOR [לשדרג]
GO
ALTER TABLE [dbo].[יחידות] ADD  CONSTRAINT [DF_יחידות_פעיל]  DEFAULT ((0)) FOR [פעיל]
GO
ALTER TABLE [dbo].[יחידות] ADD  CONSTRAINT [DF_יחידות_שולם]  DEFAULT ((0)) FOR [שולם]
GO
ALTER TABLE [dbo].[יחידות] ADD  CONSTRAINT [DF_יחידות_בוטל]  DEFAULT ((0)) FOR [בוטל]
GO
ALTER TABLE [dbo].[יחידות_שיעבודים] ADD  CONSTRAINT [DF_יחידות_שיעבודים_שעבוד_פעיל]  DEFAULT ((1)) FOR [שעבוד_פעיל]
GO
ALTER TABLE [dbo].[סיווג_יחידה] ADD  DEFAULT ((1)) FOR [שער_מכפיל]
GO
ALTER TABLE [dbo].[סיווג_יחידה] ADD  DEFAULT ((1)) FOR [קופה]
GO
ALTER TABLE [dbo].[סיווג_יחידה] ADD  DEFAULT ((0)) FOR [מס_מטבע]
GO
ALTER TABLE [dbo].[קודי_סטטוס_הקדמה] ADD  CONSTRAINT [DF_קודי_סטטוס_הקדמה_מאושר]  DEFAULT ((0)) FOR [מאושר]
GO
ALTER TABLE [dbo].[קודי_תהליכים_הקדמה] ADD  CONSTRAINT [DF_קודי_תהליכים_הקדמה_ברירת_מחדל]  DEFAULT ((0)) FOR [ברירת_מחדל]
GO
ALTER TABLE [dbo].[קודי_תהליכים_הקדמה] ADD  CONSTRAINT [DF_קודי_תהליכים_הקדמה_נדרש]  DEFAULT ((1)) FOR [נדרש]
GO
ALTER TABLE [dbo].[תהליכי_בקשת_הקדמה] ADD  CONSTRAINT [DF_תהליכי_בקשת_הקדמה_בוצע]  DEFAULT ((0)) FOR [בוצע]
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[40] 4[20] 2[20] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
         Begin Table = "יחידות (YechidotOLD.dbo)"
            Begin Extent = 
               Top = 44
               Left = 150
               Bottom = 174
               Right = 328
            End
            DisplayFlags = 280
            TopColumn = 0
         End
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
      Begin ColumnWidths = 9
         Width = 284
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'View_1'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'View_1'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[40] 4[20] 2[20] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
         Begin Table = "יחידות"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 136
               Right = 216
            End
            DisplayFlags = 280
            TopColumn = 0
         End
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'View_2'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'View_2'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[40] 4[20] 2[20] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
         Begin Table = "פרטי תנועות (הגמח_המרכזי.dbo)"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 136
               Right = 208
            End
            DisplayFlags = 280
            TopColumn = 0
         End
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'פרטי_תנועות'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'פרטי_תנועות'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[40] 4[20] 2[20] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
         Begin Table = "תנועות (הגמח_המרכזי.dbo)"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 136
               Right = 229
            End
            DisplayFlags = 280
            TopColumn = 0
         End
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'תנועות'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'תנועות'
GO
USE [master]
GO
ALTER DATABASE [Yechidot] SET  READ_WRITE 
GO
