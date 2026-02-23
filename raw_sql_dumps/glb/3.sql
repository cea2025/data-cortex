USE [master]
GO
/****** Object:  Database [AptCrmSys]    Script Date: 19/02/2026 17:12:59 ******/
CREATE DATABASE [AptCrmSys]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'AptCrmSys', FILENAME = N'H:\Data\02\AptCrmSys.mdf' , SIZE = 18880KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'AptCrmSys_log', FILENAME = N'I:\AptCrmSys_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
GO
ALTER DATABASE [AptCrmSys] SET COMPATIBILITY_LEVEL = 140
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [AptCrmSys].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [AptCrmSys] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [AptCrmSys] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [AptCrmSys] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [AptCrmSys] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [AptCrmSys] SET ARITHABORT OFF 
GO
ALTER DATABASE [AptCrmSys] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [AptCrmSys] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [AptCrmSys] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [AptCrmSys] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [AptCrmSys] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [AptCrmSys] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [AptCrmSys] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [AptCrmSys] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [AptCrmSys] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [AptCrmSys] SET  DISABLE_BROKER 
GO
ALTER DATABASE [AptCrmSys] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [AptCrmSys] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [AptCrmSys] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [AptCrmSys] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [AptCrmSys] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [AptCrmSys] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [AptCrmSys] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [AptCrmSys] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [AptCrmSys] SET  MULTI_USER 
GO
ALTER DATABASE [AptCrmSys] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [AptCrmSys] SET DB_CHAINING OFF 
GO
ALTER DATABASE [AptCrmSys] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [AptCrmSys] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [AptCrmSys] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [AptCrmSys] SET QUERY_STORE = OFF
GO
USE [AptCrmSys]
GO
/****** Object:  User [BUILTIN\Users]    Script Date: 19/02/2026 17:12:59 ******/
CREATE USER [BUILTIN\Users] FOR LOGIN [BUILTIN\Users]
GO
/****** Object:  User [Backu4Sure]    Script Date: 19/02/2026 17:12:59 ******/
CREATE USER [Backu4Sure] FOR LOGIN [Backu4Sure] WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  User [AptCrm]    Script Date: 19/02/2026 17:12:59 ******/
CREATE USER [AptCrm] WITHOUT LOGIN WITH DEFAULT_SCHEMA=[dbo]
GO
ALTER ROLE [db_owner] ADD MEMBER [BUILTIN\Users]
GO
ALTER ROLE [db_backupoperator] ADD MEMBER [Backu4Sure]
GO
ALTER ROLE [db_owner] ADD MEMBER [AptCrm]
GO
ALTER ROLE [db_datareader] ADD MEMBER [AptCrm]
GO
ALTER ROLE [db_datawriter] ADD MEMBER [AptCrm]
GO
/****** Object:  UserDefinedFunction [dbo].[GetHAnniversary]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE FUNCTION [dbo].[GetHAnniversary]
(
@PHDay nvarchar(3),
@PHMonth nvarchar(10),
@AdarType nvarchar(1)
)
RETURNS Date
AS 
BEGIN
  DECLARE @SHDate nvarchar(50)
  DECLARE @PGDate Date
  DECLARE @HYear int
  SET @PHDay = Replace(Replace(@PHDay,'"',''),'''','')
  SET @PHMonth = Replace(Replace(@PHMonth,'"',''),'''','')
  IF @AdarType='' SET @AdarType='א'

  BEGIN
    SET @HYear = YEAR(GetDate())+3760
    SELECT @PGDate = GDate FROM HebDates WHERE [HDay]=@PHDay AND HMonth=@PHMonth AND HNYear=@HYear
	IF (@PGDate IS NULL) AND ((@PHMonth='אדר א') OR (@PHMonth='אדר ב'))
	  SELECT @PGDate = GDate FROM HebDates WHERE [HDay]=@PHDay AND HMonth='אדר' AND HNYear=@HYear
    IF (@PGDate IS NULL) AND (@PHMonth='אדר')
      SELECT @PGDate = GDate FROM HebDates WHERE [HDay]=@PHDay AND HMonth='אדר '+@AdarType AND HNYear=@HYear
  END

  IF (@PGDate<Convert(DATE, GetDate()))
  BEGIN
    SET @PGDate=NULL
    SET @HYear = YEAR(GetDate())+3761
    SELECT @PGDate = GDate FROM HebDates WHERE [HDay]=@PHDay AND HMonth=@PHMonth AND HNYear=@HYear
	IF (@PGDate IS NULL) AND ((@PHMonth='אדר א') OR (@PHMonth='אדר ב'))
	  SELECT @PGDate = GDate FROM HebDates WHERE [HDay]=@PHDay AND HMonth='אדר' AND HNYear=@HYear
    IF (@PGDate IS NULL) AND (@PHMonth='אדר')
      SELECT @PGDate = GDate FROM HebDates WHERE [HDay]=@PHDay AND HMonth='אדר '+@AdarType AND HNYear=@HYear
  END

  RETURN (@PGDate)
END
GO
/****** Object:  UserDefinedFunction [dbo].[GetHDate]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[GetHDate]
(
@PGDate Date,
@HType int
)
RETURNS nvarchar(50)
AS 
BEGIN
declare @SHDate nvarchar(50)

SELECT @SHDate = CASE @HType 
  WHEN 1 THEN [HDate] 
  WHEN 2 THEN [HYear]+'-'+[HMonthO]+[HMonth]
  WHEN 3 THEN [HYear]
  WHEN 4 THEN [HMonth]
  WHEN 5 THEN [HYearN]+'-'+[HYear]
  WHEN 6 THEN [HWDay]
  END 
  FROM [HebDates] WHERE GDate=@PGDate

return (@SHDate)
END
GO
/****** Object:  UserDefinedFunction [dbo].[GetNumber]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE Function [dbo].[GetNumber](@String VarChar(256))
Returns VarChar(256)
AS
Begin
  DECLARE @Result AS VarChar(256)
  IF @String='' SET @Result = ''
  ELSE
  BEGIN
    SET @String = Trim(@String) 
    SET @Result = ISNULL(CAST(TRY_CAST(@String AS INTEGER) AS VarChar(256)),'')
    IF @Result='' SET @Result = ISNULL(CAST(TRY_CAST(SUBSTRING(@String, PATINDEX('^%[0-9]%', @String), LEN(@String)) AS int) AS VarChar(256)),'')
  END
  Return @Result
End
GO
/****** Object:  UserDefinedFunction [dbo].[GetNumber0]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO





CREATE Function [dbo].[GetNumber0](@String VarChar(Max))
Returns VarChar(Max)
AS
Begin
  Set @String = Trim(@String)
  While PatIndex('%[^0-9]%', @String) > 0 Set @String = Stuff(@String, PatIndex('%[^0-9]%', @String), 1, '')
  While SUBSTRING(@String,1,1)='0' Set @String = SUBSTRING(@String,2,Len(@String))
  Return @String
End
GO
/****** Object:  Table [dbo].[Conditions]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Conditions](
	[קוד זיהוי] [int] NOT NULL,
	[Condition] [nvarchar](50) NULL,
	[Operator] [nvarchar](50) NULL,
	[AddGr] [bit] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[HebDates]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[HebDates](
	[GDate] [date] NOT NULL,
	[GMonth] [nvarchar](12) NULL,
	[GMonthM] [nvarchar](12) NULL,
	[HDate] [nvarchar](50) NULL,
	[HYear] [nvarchar](5) NULL,
	[HMonth] [nvarchar](20) NULL,
	[HDay] [nvarchar](2) NULL,
	[HWDay] [nvarchar](10) NULL,
	[Chag] [nvarchar](50) NULL,
	[Parsha] [nvarchar](50) NULL,
	[HMonthO] [nvarchar](15) NULL,
	[HYearN] [nvarchar](5) NULL,
	[HNYear] [int] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[LabelsList]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LabelsList](
	[ID] [int] NOT NULL,
	[Company] [nvarchar](30) NULL,
	[Name] [nvarchar](50) NULL,
	[TopMargin] [float] NULL,
	[LeftMargin] [float] NULL,
	[Width] [float] NULL,
	[Height] [float] NULL,
	[Columns] [int] NULL,
	[Rows] [int] NULL,
	[ColumnSpace] [float] NULL,
	[RowSpace] [float] NULL,
	[PaperSize] [int] NULL,
	[Landscape] [bit] NULL,
	[PageWidth] [float] NULL,
	[PageHeight] [float] NULL,
 CONSTRAINT [PK_LabelsList] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Payment]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Payment](
	[IDPayment] [int] NULL,
	[Payment] [nvarchar](50) NULL,
	[Controls] [bit] NULL,
	[Milgot] [bit] NULL,
	[Company] [nvarchar](50) NULL,
	[sort] [int] NULL,
	[חזרה_חודשים] [int] NULL,
	[ApiCode] [int] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ReportsAuto]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ReportsAuto](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[IDAlfon] [int] NULL,
	[ReportName] [nvarchar](50) NULL,
	[Sended] [bit] NULL,
	[ReportUser] [bit] NULL,
 CONSTRAINT [PK_ReportsAuto] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ServerLog]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ServerLog](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[aDAteTime] [datetime] NULL,
	[IDAlfon] [nvarchar](50) NULL,
	[ReportName] [nvarchar](50) NULL,
	[UserSrv] [nvarchar](50) NULL,
 CONSTRAINT [PK_ServerLog] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Sum]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Sum](
	[Code] [nvarchar](50) NULL,
	[Sum] [nvarchar](50) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Whatsapp]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Whatsapp](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[AUser] [nvarchar](50) NULL,
	[DateCreated] [datetime] NULL,
	[Pattern] [nvarchar](20) NULL,
	[TelFrom] [nvarchar](20) NULL,
	[TelTo] [nvarchar](20) NULL,
	[FileName] [nvarchar](250) NULL,
	[Param1] [nvarchar](50) NULL,
	[Param2] [nvarchar](50) NULL,
	[Param3] [nvarchar](50) NULL,
	[Param4] [nvarchar](50) NULL,
	[Param5] [nvarchar](50) NULL,
	[Error] [nvarchar](50) NULL,
	[Sended] [bit] NULL,
	[DateSend] [datetime] NULL,
 CONSTRAINT [PK_Whatsapp] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ZmanimPlacess]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ZmanimPlacess](
	[PLACE] [nvarchar](15) NULL,
	[LAT] [float] NULL,
	[LONG] [float] NULL,
	[TDFG] [float] NULL,
	[HIGHT] [float] NULL,
	[HDLN] [float] NULL,
	[DST_BEGIN] [datetime] NULL,
	[DST_END] [datetime] NULL,
	[DST_AREA] [int] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[זהות_לקוח]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[זהות_לקוח](
	[ID] [int] NOT NULL,
	[זהות לקוח] [nvarchar](100) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[חודשים]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[חודשים](
	[מס_חודש] [nvarchar](2) NOT NULL,
	[חודש] [nvarchar](15) NULL,
	[עברי] [nvarchar](12) NULL,
 CONSTRAINT [PK_חודשים] PRIMARY KEY CLUSTERED 
(
	[מס_חודש] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[טבלאות]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[טבלאות](
	[טבלה] [nvarchar](250) NOT NULL,
	[כותרת] [nvarchar](50) NULL,
	[מחלקה] [nvarchar](50) NULL,
	[מכתבים] [nvarchar](50) NULL,
	[סדר] [int] NULL,
	[IDFIeld] [nvarchar](50) NULL,
	[FunctionName] [nvarchar](50) NULL,
	[IDAlfonField] [nvarchar](50) NULL,
	[SQL] [nvarchar](max) NULL,
	[שיוך_טופס] [nvarchar](50) NULL,
 CONSTRAINT [PK_טבלאות] PRIMARY KEY CLUSTERED 
(
	[טבלה] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[מהות_רשומה]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[מהות_רשומה](
	[ID] [int] NOT NULL,
	[מהות הרשומה] [nvarchar](100) NULL,
	[סוג] [int] NULL,
	[מהות] [nvarchar](50) NULL,
 CONSTRAINT [מהות_רשומה$PrimaryKey] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[מחלקות]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[מחלקות](
	[מיון] [int] NOT NULL,
	[מחלקה] [nvarchar](50) NOT NULL,
	[Program] [nvarchar](25) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[מנויים]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[מנויים](
	[IDAlfon] [int] NOT NULL,
	[קוד_משלם] [int] NULL,
	[תאריך קליטה] [datetime] NULL,
	[קליטה עברי] [nvarchar](50) NULL,
	[קוד_מחירון] [int] NULL,
	[סוג_משלוח] [nvarchar](20) NULL,
	[מתאריך] [datetime] NULL,
	[מעברי] [nvarchar](50) NULL,
	[מגליון] [int] NULL,
	[סיווג_מנוי] [nvarchar](20) NULL,
	[סיווג_מנוי2] [nvarchar](20) NULL,
	[איזור_חלוקה] [nvarchar](30) NULL,
	[סגירה] [bit] NULL,
	[הערות] [nvarchar](1000) NULL,
	[תאריך_ביטול] [datetime] NULL,
	[הפסקה עברי] [nvarchar](30) NULL,
	[סיבת הפסקה] [nvarchar](30) NULL,
	[פעיל] [bit] NULL,
	[סוכן] [int] NULL,
	[מס_גליונות] [int] NULL,
	[מס_תנועה] [int] NULL,
	[פרטים] [nvarchar](1000) NULL,
	[מתנה] [nvarchar](50) NULL,
	[טקסט1] [nvarchar](50) NULL,
	[טקסט2] [nvarchar](50) NULL,
	[עד_גליון] [int] NULL,
	[סיווג_מנוי3] [nvarchar](30) NULL,
	[סוג_גליון] [nvarchar](50) NULL,
	[אמצעי] [nvarchar](20) NULL,
 CONSTRAINT [PK_מנויים_1] PRIMARY KEY CLUSTERED 
(
	[IDAlfon] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[סוגי_תנועות_מלאי]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[סוגי_תנועות_מלאי](
	[קוד_סוג] [int] NOT NULL,
	[סוג] [nvarchar](255) NULL,
	[חישוב_מלאי] [int] NULL,
	[חישוב_מחסן] [int] NULL,
	[חישוב_למשלוח] [int] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[סולקים]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[סולקים](
	[קוד_סולק] [int] NOT NULL,
	[חברה] [nvarchar](50) NULL,
 CONSTRAINT [PK_סולקים] PRIMARY KEY CLUSTERED 
(
	[קוד_סולק] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[סטטוס_ביטול_אשראי]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[סטטוס_ביטול_אשראי](
	[קוד] [int] NOT NULL,
	[חברה] [nvarchar](50) NOT NULL,
	[סטטוס] [nvarchar](50) NULL,
	[קוד_סוג] [int] NULL,
 CONSTRAINT [PK_סטטוס_ביטול_אשראי] PRIMARY KEY CLUSTERED 
(
	[קוד] ASC,
	[חברה] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[סיבות_דחיה]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[סיבות_דחיה](
	[ID] [nvarchar](2) NOT NULL,
	[סיבת הדחיה] [nvarchar](100) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[סיבות_החזרה]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[סיבות_החזרה](
	[ID] [int] NOT NULL,
	[תיאור מקוצר] [nvarchar](25) NULL,
	[תיאור] [nvarchar](255) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[סיווגים_מערכת]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[סיווגים_מערכת](
	[קוד_זיהוי] [int] NOT NULL,
	[שדה] [nvarchar](50) NOT NULL,
	[סיווג] [nvarchar](50) NOT NULL,
	[ערך] [int] NULL,
	[טקסט] [nvarchar](50) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[קודי_אנשי_צוות]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[קודי_אנשי_צוות](
	[קוד_סוג] [int] NOT NULL,
	[סוג] [nvarchar](50) NULL,
 CONSTRAINT [PK_קודי_אנשי_צוות] PRIMARY KEY CLUSTERED 
(
	[קוד_סוג] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[קודי_סטטוס_מלאי]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[קודי_סטטוס_מלאי](
	[קוד_סטטוס] [int] NOT NULL,
	[סטטוס_מלאי] [nvarchar](255) NULL,
	[מחסנים] [int] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[קודי_שיוך_מלאי]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[קודי_שיוך_מלאי](
	[קוד_שיוך] [int] NOT NULL,
	[שיוך] [nvarchar](255) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[שדות]    Script Date: 19/02/2026 17:12:59 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[שדות](
	[טבלה] [nvarchar](50) NOT NULL,
	[שם_שדה] [nvarchar](250) NOT NULL,
	[מספר] [int] NULL,
	[סוג] [nvarchar](50) NULL,
	[גודל] [nvarchar](50) NULL,
	[מפתח] [bit] NULL,
	[איתור] [bit] NULL,
	[הצגה] [bit] NULL,
	[Type] [int] NULL,
	[פורמט] [nvarchar](30) NULL,
	[Fornat] [bit] NULL,
	[קישור] [bit] NULL,
	[מקור] [nvarchar](50) NULL,
	[כותרת_שדה] [nvarchar](50) NULL,
 CONSTRAINT [PK_שדות] PRIMARY KEY CLUSTERED 
(
	[טבלה] ASC,
	[שם_שדה] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_LabelsList_Company]    Script Date: 19/02/2026 17:12:59 ******/
CREATE NONCLUSTERED INDEX [IX_LabelsList_Company] ON [dbo].[LabelsList]
(
	[Company] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_LabelsList_Name]    Script Date: 19/02/2026 17:12:59 ******/
CREATE NONCLUSTERED INDEX [IX_LabelsList_Name] ON [dbo].[LabelsList]
(
	[Name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Whatsapp]    Script Date: 19/02/2026 17:12:59 ******/
CREATE NONCLUSTERED INDEX [IX_Whatsapp] ON [dbo].[Whatsapp]
(
	[TelTo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_Whatsapp_1]    Script Date: 19/02/2026 17:12:59 ******/
CREATE NONCLUSTERED INDEX [IX_Whatsapp_1] ON [dbo].[Whatsapp]
(
	[DateSend] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_Whatsapp_2]    Script Date: 19/02/2026 17:12:59 ******/
CREATE NONCLUSTERED INDEX [IX_Whatsapp_2] ON [dbo].[Whatsapp]
(
	[DateCreated] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [זהות_לקוח$ID]    Script Date: 19/02/2026 17:12:59 ******/
CREATE UNIQUE NONCLUSTERED INDEX [זהות_לקוח$ID] ON [dbo].[זהות_לקוח]
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_חודשים]    Script Date: 19/02/2026 17:12:59 ******/
CREATE NONCLUSTERED INDEX [IX_חודשים] ON [dbo].[חודשים]
(
	[עברי] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [סיבות_דחיה$ID]    Script Date: 19/02/2026 17:12:59 ******/
CREATE UNIQUE NONCLUSTERED INDEX [סיבות_דחיה$ID] ON [dbo].[סיבות_דחיה]
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [סיבות_החזרה$ID]    Script Date: 19/02/2026 17:12:59 ******/
CREATE UNIQUE NONCLUSTERED INDEX [סיבות_החזרה$ID] ON [dbo].[סיבות_החזרה]
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Payment] ADD  DEFAULT ((0)) FOR [IDPayment]
GO
ALTER TABLE [dbo].[Payment] ADD  DEFAULT ((0)) FOR [Controls]
GO
ALTER TABLE [dbo].[Payment] ADD  DEFAULT ((0)) FOR [Milgot]
GO
ALTER TABLE [dbo].[Payment] ADD  DEFAULT ('0') FOR [חזרה_חודשים]
GO
ALTER TABLE [dbo].[ReportsAuto] ADD  CONSTRAINT [DF_Table_1_Send]  DEFAULT ((0)) FOR [Sended]
GO
ALTER TABLE [dbo].[זהות_לקוח] ADD  DEFAULT ((0)) FOR [ID]
GO
ALTER TABLE [dbo].[מהות_רשומה] ADD  DEFAULT ((0)) FOR [סוג]
GO
ALTER TABLE [dbo].[סיבות_החזרה] ADD  DEFAULT ((0)) FOR [ID]
GO
USE [master]
GO
ALTER DATABASE [AptCrmSys] SET  READ_WRITE 
GO
